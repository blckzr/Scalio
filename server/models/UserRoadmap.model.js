const db = require('../config/database');
const logger = require('../utils/logger');

class UserRoadmap {
  static async findById(roadmapId, userId = null) {
    try {
      let query = db
        .from('user_roadmaps')
        .select(`
          *,
          roadmap_templates (
            template_id,
            title,
            description,
            source_type,
            version
          ),
          user_roadmap_modules (
            module_id,
            skill_id,
            module_name,
            sequence_order,
            status,
            started_at,
            completed_at,
            Skills (
              skill_id,
              skill_name,
              skill_category
            )
          )
        `)
        .eq('user_roadmap_id', roadmapId);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query.single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error finding user roadmap by ID:', error);
      throw error;
    }
  }

  static async findByUserId(userId, activeOnly = false) {
    try {
      let query = db
        .from('user_roadmaps')
        .select(`
          user_roadmap_id,
          template_id,
          roadmap_version,
          status,
          progress_percentage,
          started_at,
          completed_at,
          estimated_completion_date,
          is_active,
          roadmap_templates (
            template_id,
            title,
            description,
            source_type
          )
        `)
        .eq('user_id', userId);

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      query = query.order('started_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error finding roadmaps by user ID:', error);
      throw error;
    }
  }

  static async create(roadmapData) {
    try {
      const insertData = {
        user_id: roadmapData.user_id,  
        template_id: roadmapData.template_id,
        roadmap_version: roadmapData.roadmap_version || '1.0',
        status: roadmapData.status || 'not_started',
        progress_percentage: roadmapData.progress_percentage || 0,
        is_active: roadmapData.is_active !== false,
        estimated_completion_date: roadmapData.estimated_completion_date
      };

      if (roadmapData.user_id_legacy) {
        insertData.user_id_legacy = roadmapData.user_id_legacy;
      }

      const { data, error } = await db
        .from('user_roadmaps')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error creating user roadmap:', error);
      throw error;
    }
  }

  static async updateProgress(roadmapId, progressData) {
    try {
      const { data, error } = await db
        .from('user_roadmaps')
        .update({
          progress_percentage: progressData.progress_percentage,
          status: progressData.status,
          updated_at: new Date()
        })
        .eq('user_roadmap_id', roadmapId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error updating roadmap progress:', error);
      throw error;
    }
  }

  static async updateStatus(roadmapId, status) {
    try {
      const updates = {
        status,
        updated_at: new Date()
      };

      if (status === 'in_progress' && !updates.started_at) {
        updates.started_at = new Date();
      }

      if (status === 'completed') {
        updates.completed_at = new Date();
        updates.progress_percentage = 100;
      }

      const { data, error } = await db
        .from('user_roadmaps')
        .update(updates)
        .eq('user_roadmap_id', roadmapId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error updating roadmap status:', error);
      throw error;
    }
  }

  static async deactivate(roadmapId) {
    try {
      const { data, error } = await db
        .from('user_roadmaps')
        .update({ is_active: false })
        .eq('user_roadmap_id', roadmapId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error deactivating roadmap:', error);
      throw error;
    }
  }

  static async getModules(roadmapId) {
    try {
      const { data, error } = await db
        .from('user_roadmap_modules')
        .select(`
          module_id,
          skill_id,
          module_name,
          sequence_order,
          status,
          started_at,
          completed_at,
          Skills (
            skill_id,
            skill_name,
            skill_category
          )
        `)
        .eq('user_roadmap_id', roadmapId)
        .order('sequence_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error getting roadmap modules:', error);
      throw error;
    }
  }


  static async createModules(modules) {
    try {
      const { data, error } = await db
        .from('user_roadmap_modules')
        .insert(modules)
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error creating roadmap modules:', error);
      throw error;
    }
  }

  static async updateModuleStatus(moduleId, status) {
    try {
      const updates = {
        status,
        updated_at: new Date()
      };

      if (status === 'in_progress') {
        updates.started_at = new Date();
      }

      if (status === 'completed') {
        updates.completed_at = new Date();
      }

      const { data, error } = await db
        .from('user_roadmap_modules')
        .update(updates)
        .eq('module_id', moduleId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error updating module status:', error);
      throw error;
    }
  }

 
  static async calculateProgress(roadmapId) {
    try {
      const { data: modules, error } = await db
        .from('user_roadmap_modules')
        .select('module_id, status')
        .eq('user_roadmap_id', roadmapId);

      if (error) throw error;

      if (!modules || modules.length === 0) {
        return 0;
      }

      const completedModules = modules.filter(m => m.status === 'completed').length;
      const progressPercentage = Math.round((completedModules / modules.length) * 100);

      await this.updateProgress(roadmapId, {
        progress_percentage: progressPercentage,
        status: progressPercentage === 100 ? 'completed' : 
                progressPercentage > 0 ? 'in_progress' : 'not_started'
      });

      return progressPercentage;
    } catch (error) {
      logger.error('Error calculating roadmap progress:', error);
      throw error;
    }
  }

  static async hasActiveRoadmap(userId, templateId) {
    try {
      const { data, error } = await db
        .from('user_roadmaps')
        .select('user_roadmap_id')
        .eq('user_id', userId)
        .eq('template_id', templateId)
        .eq('is_active', true)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      logger.error('Error checking active roadmap:', error);
      throw error;
    }
  }
}

module.exports = UserRoadmap;
