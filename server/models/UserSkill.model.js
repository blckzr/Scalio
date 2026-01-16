const db = require('../config/database');
const { supabaseAdmin } = require('../config/database');
const logger = require('../utils/logger');

class UserSkill {
  static async findById(skillAssessmentId) {
    try {
      const { data, error } = await db
        .from('user_skills')
        .select(`
          *,
          Skills (
            skill_id,
            skill_name,
            skill_category
          )
        `)
        .eq('id', skillAssessmentId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error finding user skill by ID:', error);
      throw error;
    }
  }

  static async findByUserId(userId) {
    try {
      const { data, error } = await db
        .from('user_skills')
        .select(`
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
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error finding skills by user ID:', error);
      throw error;
    }
  }

  static async findByProficiency(userId, proficiencyLevel) {
    try {
      const { data, error } = await db
        .from('user_skills')
        .select(`
          id,
          skill_id,
          proficiency_level,
          assessed_at,
          Skills (
            skill_id,
            skill_name,
            skill_category
          )
        `)
        .eq('user_id', userId)
        .eq('proficiency_level', proficiencyLevel)
        .order('assessed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error finding skills by proficiency:', error);
      throw error;
    }
  }

  static async upsert(userId, skillId, proficiencyLevel) {
    try {
      const { data, error } = await db
        .from('user_skills')
        .upsert({
          user_id: userId,
          skill_id: skillId,
          proficiency_level: proficiencyLevel,
          updated_at: new Date()
        }, {
          onConflict: 'user_id,skill_id'
        })
        .select(`
          *,
          Skills (
            skill_id,
            skill_name,
            skill_category
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error upserting user skill:', error);
      throw error;
    }
  }

  static async create(assessmentData) {
    try {
      const { data, error } = await db
        .from('user_skills')
        .insert({
          user_id: assessmentData.user_id,
          skill_id: assessmentData.skill_id,
          proficiency_level: assessmentData.proficiency_level
        })
        .select(`
          *,
          Skills (
            skill_id,
            skill_name,
            skill_category
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error creating user skill:', error);
      throw error;
    }
  }

  static async updateProficiency(assessmentId, proficiencyLevel) {
    try {
      const { data, error } = await db
        .from('user_skills')
        .update({
          proficiency_level: proficiencyLevel,
          updated_at: new Date()
        })
        .eq('id', assessmentId)
        .select(`
          *,
          Skills (
            skill_id,
            skill_name,
            skill_category
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error updating skill proficiency:', error);
      throw error;
    }
  }

  static async delete(assessmentId) {
    try {
      const { error } = await db
        .from('user_skills')
        .delete()
        .eq('id', assessmentId);

      if (error) throw error;
      return { success: true, message: 'Skill assessment deleted' };
    } catch (error) {
      logger.error('Error deleting user skill:', error);
      throw error;
    }
  }

  static async batchCreate(userId, skills) {
    try {
      const assessments = skills.map(skill => ({
        user_id: userId,
        skill_id: skill.skill_id,
        proficiency_level: skill.proficiency_level
      }));

      const { data, error } = await db
        .from('user_skills')
        .insert(assessments)
        .select(`
          *,
          Skills (
            skill_id,
            skill_name,
            skill_category
          )
        `);

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error batch creating skills:', error);
      throw error;
    }
  }

  static async getSkillCountByProficiency(userId) {
    try {
      const { data, error } = await db
        .from('user_skills')
        .select('proficiency_level')
        .eq('user_id', userId);

      if (error) throw error;

      const counts = {
        beginner: 0,
        intermediate: 0,
        advanced: 0,
        total: data?.length || 0
      };

      data?.forEach(skill => {
        if (counts.hasOwnProperty(skill.proficiency_level)) {
          counts[skill.proficiency_level]++;
        }
      });

      return counts;
    } catch (error) {
      logger.error('Error getting skill count:', error);
      throw error;
    }
  }

  static async findBySkillName(userId, skillName) {
    try {
      const { data, error } = await db
        .from('user_skills')
        .select(`
          *,
          Skills!inner (
            skill_id,
            skill_name,
            skill_category
          )
        `)
        .eq('user_id', userId)
        .ilike('Skills.skill_name', skillName)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      logger.error('Error finding skill by name:', error);
      throw error;
    }
  }

  static async getRecentAssessments(userId, limit = 5) {
    try {
      const { data, error } = await db
        .from('user_skills')
        .select(`
          id,
          skill_id,
          proficiency_level,
          assessed_at,
          Skills (
            skill_id,
            skill_name,
            skill_category
          )
        `)
        .eq('user_id', userId)
        .order('assessed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error getting recent assessments:', error);
      throw error;
    }
  }

  static async hasAssessed(userId, skillId) {
    try {
      const { data, error } = await db
        .from('user_skills')
        .select('id')
        .eq('user_id', userId)
        .eq('skill_id', skillId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      logger.error('Error checking skill assessment:', error);
      throw error;
    }
  }
}

module.exports = UserSkill;
