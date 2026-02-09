const db = require('../config/database');
const logger = require('../utils/logger');

class RoadmapTemplate {

  // =========================================================
  // 1. DETAIL VIEW (Includes 'roadmap_data')
  // Used by: getRoadmapDetail (Controller #4)
  // =========================================================
  static async findById(templateId) {
    try {
      const { data, error } = await db
        .from('roadmap_templates')
        .select('*') // Selects everything (including the huge JSON)
        .eq('template_id', templateId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error finding template by ID:', error);
      throw error;
    }
  }

  // =========================================================
  // 2. LIST VIEWS (EXCLUDES 'roadmap_data')
  // Used by: getRecommendedRoadmaps (Controller #3)
  // =========================================================

  static async findBestMatch(userTags = []) {
    try {
      // STRICT SELECT: Explicitly exclude 'roadmap_data'
      const { data: templates, error } = await db
        .from('roadmap_templates')
        .select('template_id, title, description, category, tags, version, is_active, created_at') 
        .eq('is_active', true);

      if (error) throw error;

      if (!userTags || userTags.length === 0) {
        return templates.slice(0, 5);
      }

      // SCORING ENGINE
      const scoredTemplates = templates.map(template => {
        let score = 0;
        const templateTags = (template.tags || []).map(t => t.toLowerCase());
        const title = template.title.toLowerCase();
        
        // 1. Tag Match
        userTags.forEach(uTag => {
          if (templateTags.some(t => t.includes(uTag.toLowerCase()))) {
            score += 1;
          }
        });

        // 2. Title Match
        userTags.forEach(uTag => {
            if (title.includes(uTag.toLowerCase())) {
                score += 2;
            }
        });

        // 3. Role Priority (Fixes the "Node.js > Backend" issue)
        const roleKeywords = ['backend', 'frontend', 'fullstack', 'devops', 'mobile'];
        if (roleKeywords.some(keyword => title.includes(keyword))) {
            score += 15; 
        }

        return { ...template, matchScore: score };
      });

      // Sort Descending
      return scoredTemplates
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5); 

    } catch (error) {
      logger.error('Error finding best match template:', error);
      return [];
    }
  }

  // Fallback 1: Category (Lightweight)
  static async findByCategory(category) {
    try {
      const { data, error } = await db
        .from('roadmap_templates')
        .select('template_id, title, description, category, tags, version, is_active')
        .eq('is_active', true)
        .ilike('category', `%${category}%`)
        .limit(5);

      if (error) throw error;
      return data || [];
    } catch (error) {
      return [];
    }
  }

  // Fallback 2: Find All (Lightweight)
  static async findAll(options = {}) {
    try {
      let query = db
        .from('roadmap_templates')
        .select('template_id, title, description, category, tags, version, is_active')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (options.limit) query = query.limit(options.limit);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = RoadmapTemplate;