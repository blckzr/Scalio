const db = require('../config/database');
const { supabaseAdmin } = require('../config/database');
const logger = require('../utils/logger');

class User {
  static async findById(userId) {
    try {
      const { data, error } = await db
        .from('UserProfiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const { data, error } = await db
        .from('UserProfiles')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
  }

  static async create(userData) {
    try {
      const { data, error } = await db
        .from('UserProfiles')
        .insert({
          user_id: userData.user_id,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          middle_name: userData.middle_name,
          birthday: userData.birthday,
          contact_number: userData.contact_number,
          role: userData.role || 'user'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  static async update(userId, updates) {
    try {
      const { data, error } = await db
        .from('UserProfiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  static async delete(userId) {
    try {
      // Delete from UserProfiles table
      const { error: profileError } = await db
        .from('UserProfiles')
        .delete()
        .eq('user_id', userId);

      if (profileError) throw profileError;

      // Delete from Supabase Auth (admin only)
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      
      if (authError) {
        logger.warn(`Failed to delete auth user: ${authError.message}`);
      }

      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }

  static async getUserWithSkills(userId) {
    try {
      const { data, error } = await db
        .from('UserProfiles')
        .select(`
          *,
          user_skills (
            id,
            skill_id,
            proficiency_level,
            assessed_at,
            updated_at,
            Skills (
              skill_id,
              skill_name,
              skill_category
            )
          )
        `)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error getting user with skills:', error);
      throw error;
    }
  }

  static async getUserWithRoadmaps(userId) {
    try {
      const { data, error } = await db
        .from('UserProfiles')
        .select(`
          *,
          user_roadmaps (
            user_roadmap_id,
            template_id,
            roadmap_version,
            status,
            progress_percentage,
            started_at,
            completed_at,
            is_active,
            roadmap_templates (
              template_id,
              title,
              description,
              source_type
            )
          )
        `)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error getting user with roadmaps:', error);
      throw error;
    }
  }

  static async getAll() {
    try {
      const { data, error } = await db
        .from('UserProfiles')
        .select('user_id, email, first_name, last_name, role')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error getting all users:', error);
      throw error;
    }
  }

  static async getUserStats(userId) {
    try {
      const { data: roadmapsCount } = await db
        .from('user_roadmaps')
        .select('user_roadmap_id', { count: 'exact' })
        .eq('user_id', userId);

      const { data: skillsCount } = await db
        .from('user_skills')
        .select('id', { count: 'exact' })
        .eq('user_id', userId);

      const { data: completedRoadmaps } = await db
        .from('user_roadmaps')
        .select('user_roadmap_id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('status', 'completed');

      return {
        total_roadmaps: roadmapsCount?.length || 0,
        total_skills_assessed: skillsCount?.length || 0,
        completed_roadmaps: completedRoadmaps?.length || 0
      };
    } catch (error) {
      logger.error('Error getting user stats:', error);
      throw error;
    }
  }
}

module.exports = User;