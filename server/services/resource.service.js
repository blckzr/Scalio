const db = require('../config/database');
const { supabaseAdmin } = require('../config/database');
const logger = require('../utils/logger');

class ResourceService {
  /**
   * Get recommended learning resources based on user's skills
   */
  async getRecommendations(userId) {
    try {
      // Get user's skills and proficiency levels
      const { data: userSkills, error: skillError } = await db
        .from('user_skills')
        .select(`
          proficiency_level,
          Skills (
            skill_id,
            skill_name
          )
        `)
        .eq('user_id', userId);

      if (skillError) throw skillError;

      if (!userSkills || userSkills.length === 0) {
        return {
          message: 'No skills assessed yet. Complete a skill assessment first.',
          recommendations: []
        };
      }

      // Get resources for user's skills matched to their proficiency level
      const recommendations = [];

      for (const userSkill of userSkills) {
        const skillId = userSkill.Skills?.skill_id;
        const skillName = userSkill.Skills?.skill_name;
        const userLevel = userSkill.proficiency_level;

        // Recommend next level resources
        const nextLevel = this.getNextLevel(userLevel);

        const { data: resources, error: resourceError } = await supabaseAdmin
          .from('learning_resources')
          .select('*')
          .eq('skill_id', skillId)
          .eq('difficulty_level', nextLevel)
          .order('rating', { ascending: false })
          .limit(3);

        if (resourceError) {
          logger.error(`Error fetching resources for skill ${skillName}:`, resourceError);
          continue;
        }

        if (resources && resources.length > 0) {
          recommendations.push({
            skill_name: skillName,
            current_level: userLevel,
            recommended_level: nextLevel,
            resources: resources.map(r => ({
              id: r.id,
              title: r.title,
              description: r.description,
              type: r.resource_type,
              url: r.url,
              duration_minutes: r.duration_minutes,
              is_free: r.is_free,
              provider: r.provider,
              rating: r.rating
            }))
          });
        }
      }

      logger.info(`Generated ${recommendations.length} resource recommendations for user ${userId}`);

      return {
        total_skills: userSkills.length,
        recommendations_available: recommendations.length,
        recommendations: recommendations
      };
    } catch (error) {
      logger.error(`Error getting recommendations for user ${userId}:`, error);
      throw error;
    }
  }

  async getResourcesBySkill(skillName, difficulty = null, resourceType = null) {
    try {
      // Find skill by name
      const { data: skill, error: skillError } = await supabaseAdmin
        .from('Skills')
        .select('skill_id, skill_name')
        .ilike('skill_name', skillName)
        .single();

      if (skillError || !skill) {
        throw new Error(`Skill "${skillName}" not found`);
      }

      // Build query
      let query = supabaseAdmin
        .from('learning_resources')
        .select('*')
        .eq('skill_id', skill.skill_id);

      if (difficulty) {
        query = query.eq('difficulty_level', difficulty);
      }

      if (resourceType) {
        query = query.eq('resource_type', resourceType);
      }

      const { data: resources, error: resourceError } = await query
        .order('rating', { ascending: false })
        .order('is_free', { ascending: false });

      if (resourceError) throw resourceError;

      logger.info(`Found ${resources?.length || 0} resources for ${skillName}`);

      return {
        skill_name: skill.skill_name,
        filters: { difficulty, resource_type: resourceType },
        total_resources: resources?.length || 0,
        resources: resources || []
      };
    } catch (error) {
      logger.error('Error getting resources by skill:', error);
      throw error;
    }
  }

  async addResource(resourceData) {
    try {
      const {
        skill_name,
        title,
        description,
        resource_type,
        difficulty_level,
        url,
        duration_minutes,
        is_free,
        provider,
        rating
      } = resourceData;

      // Validate required fields
      if (!skill_name || !title || !resource_type || !difficulty_level || !url) {
        throw new Error('Missing required fields: skill_name, title, resource_type, difficulty_level, url');
      }

      // Find or create skill
      let { data: skill } = await supabaseAdmin
        .from('Skills')
        .select('skill_id')
        .ilike('skill_name', skill_name)
        .single();

      if (!skill) {
        const { data: newSkill, error: createError } = await supabaseAdmin
          .from('Skills')
          .insert({ skill_name, skill_category: 'technical' })
          .select('skill_id')
          .single();

        if (createError) throw createError;
        skill = newSkill;
      }

      // Insert resource
      const { data: resource, error: insertError } = await supabaseAdmin
        .from('learning_resources')
        .insert({
          skill_id: skill.skill_id,
          title,
          description,
          resource_type,
          difficulty_level,
          url,
          duration_minutes: duration_minutes || null,
          is_free: is_free !== undefined ? is_free : true,
          provider: provider || null,
          rating: rating || null
        })
        .select()
        .single();

      if (insertError) throw insertError;

      logger.info(`Added resource "${title}" for skill "${skill_name}"`);

      return resource;
    } catch (error) {
      logger.error('Error adding resource:', error);
      throw error;
    }
  }

  async getLearningPath(skillName) {
    try {
      // Find skill
      const { data: skill, error: skillError } = await supabaseAdmin
        .from('Skills')
        .select('skill_id, skill_name')
        .ilike('skill_name', skillName)
        .single();

      if (skillError || !skill) {
        throw new Error(`Skill "${skillName}" not found`);
      }

      // Get resources for all levels
      const { data: resources, error: resourceError } = await supabaseAdmin
        .from('learning_resources')
        .select('*')
        .eq('skill_id', skill.skill_id)
        .order('difficulty_level', { ascending: true })
        .order('rating', { ascending: false });

      if (resourceError) throw resourceError;

      // Group by difficulty level
      const learningPath = {
        skill_name: skill.skill_name,
        beginner: resources?.filter(r => r.difficulty_level === 'beginner') || [],
        intermediate: resources?.filter(r => r.difficulty_level === 'intermediate') || [],
        advanced: resources?.filter(r => r.difficulty_level === 'advanced') || []
      };

      const totalResources = (learningPath.beginner.length + 
                              learningPath.intermediate.length + 
                              learningPath.advanced.length);

      logger.info(`Generated learning path for ${skillName} with ${totalResources} resources`);

      return {
        ...learningPath,
        total_resources: totalResources,
        estimated_total_hours: Math.round(
          resources?.reduce((sum, r) => sum + (r.duration_minutes || 0), 0) / 60
        )
      };
    } catch (error) {
      logger.error('Error getting learning path:', error);
      throw error;
    }
  }

  getNextLevel(currentLevel) {
    const levels = { 'beginner': 'intermediate', 'intermediate': 'advanced', 'advanced': 'advanced' };
    return levels[currentLevel] || 'beginner';
  }
}

module.exports = new ResourceService();
