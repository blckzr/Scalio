const db = require('../config/database');
const { supabaseAdmin } = require('../config/database');
const logger = require('../utils/logger');

class RoadmapTemplate {
  static async findById(templateId) {
    try {
      const { data, error } = await db
        .from('roadmap_templates')
        .select('*')
        .eq('template_id', templateId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error finding template by ID:', error);
      throw error;
    }
  }

  static async findByIdAndVersion(templateId, version) {
    try {
      const { data, error } = await db
        .from('roadmap_templates')
        .select('*')
        .eq('template_id', templateId)
        .eq('version', version)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error finding template by ID and version:', error);
      throw error;
    }
  }

  static async getAllActive() {
    try {
      const { data, error } = await db
        .from('roadmap_templates')
        .select('template_id, title, description, source_type, version, created_at, updated_at')
        .eq('is_active', true)
        .order('title', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error getting all active templates:', error);
      throw error;
    }
  }

  static async search(searchTerm) {
    try {
      const { data, error } = await db
        .from('roadmap_templates')
        .select('template_id, title, description, source_type, version')
        .eq('is_active', true)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('title', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error searching templates:', error);
      throw error;
    }
  }

  static async findBestMatch(learningGoal) {
    try {
      const searchTerm = learningGoal.toLowerCase().trim();

      // Try exact match first
      let { data, error } = await db
        .from('roadmap_templates')
        .select('*')
        .eq('is_active', true)
        .ilike('title', `%${searchTerm}%`)
        .order('version', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        return data[0];
      }

      // Try fuzzy match on description
      ({ data, error } = await db
        .from('roadmap_templates')
        .select('*')
        .eq('is_active', true)
        .ilike('description', `%${searchTerm}%`)
        .order('version', { ascending: false })
        .limit(1));

      if (error) throw error;

      if (data && data.length > 0) {
        return data[0];
      }

      // Return first active template as fallback
      ({ data, error } = await db
        .from('roadmap_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1));

      if (error) throw error;

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      logger.error('Error finding best match template:', error);
      throw error;
    }
  }

  static async getBySourceType(sourceType) {
    try {
      const { data, error } = await db
        .from('roadmap_templates')
        .select('template_id, title, description, source_type, version, created_at')
        .eq('source_type', sourceType)
        .eq('is_active', true)
        .order('title', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error getting templates by source type:', error);
      throw error;
    }
  }

  static async create(templateData) {
    try {
      const { data, error } = await supabaseAdmin
        .from('roadmap_templates')
        .insert({
          title: templateData.title,
          description: templateData.description,
          category: templateData.category,
          source_type: templateData.source_type || 'custom',
          source_url: templateData.source_url,
          roadmap_data: templateData.roadmap_data,
          version: templateData.version || '1.0',
          is_active: templateData.is_active !== false,
          created_by: templateData.created_by
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error creating template:', error);
      throw error;
    }
  }

  static async update(templateId, updates) {
    try {
      const { data, error } = await supabaseAdmin
        .from('roadmap_templates')
        .update({
          ...updates,
          updated_at: new Date()
        })
        .eq('template_id', templateId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error updating template:', error);
      throw error;
    }
  }

  static async deactivate(templateId) {
    try {
      const { data, error } = await supabaseAdmin
        .from('roadmap_templates')
        .update({ is_active: false })
        .eq('template_id', templateId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error deactivating template:', error);
      throw error;
    }
  }

  static async getVersions(templateId) {
    try {
      const { data, error } = await db
        .from('roadmap_templates')
        .select('template_id, title, version, created_at, is_active')
        .eq('template_id', templateId)
        .order('version', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error getting template versions:', error);
      throw error;
    }
  }

  static extractSkills(templateData) {
    const skills = [];

    if (!templateData || !templateData.nodes) {
      return skills;
    }

    // Extract from nodes (topics and subtopics)
    templateData.nodes.forEach(node => {
      if (node.type === 'topic' || node.type === 'subtopic') {
        skills.push({
          id: node.id,
          name: node.data?.label || node.id,
          type: node.type,
          description: node.data?.description || '',
          resources: node.data?.resources || []
        });
      }
    });

    return skills;
  }
}

module.exports = RoadmapTemplate;
