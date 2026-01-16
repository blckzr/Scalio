const db = require('../config/database');
const { supabaseAdmin } = require('../config/database');
const logger = require('../utils/logger');

class RoadmapTemplate {
  static async findById(templateId) {
    try {
      const { data, error } = await db
        .from('roadmap_templates')
        .select('template_id, title, description, category, source_type, source_url, roadmap_data, version, is_active, created_by, created_at, updated_at, tags')
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
        .select('template_id, title, description, category, source_type, source_url, roadmap_data, version, is_active, created_by, created_at, updated_at, tags')
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
        .select('template_id, title, description, source_type, version, created_at, updated_at, tags')
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
        .select('template_id, title, description, source_type, version, tags')
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

  static async findBestMatch(tags) {
    try {
      const { data: templates, error } = await db
        .from('roadmap_templates')
        .select('template_id, title, description, category, source_type, source_url, roadmap_data, version, is_active, created_by, created_at, updated_at, tags')
        .eq('is_active', true);

      if (error) throw error;
      if (!templates || templates.length === 0) return null;

      let bestMatch = null;
      let maxScore = -1;
      let minTagCount = Infinity;

      // Example tag weights (can be loaded from config/db)
      const tagWeights = {
        'javascript': 3, 'html': 2, 'css': 2, 'react': 3, 'frontend': 1,
        'node.js': 3, 'express': 2, 'backend': 1, 'api': 2, 'database': 2,
        'devops': 2, 'cloud': 2, 'docker': 2, 'kubernetes': 2,
        'ai': 3, 'machine learning': 3, 'python': 2, 'llm': 2, 'rust': 2
      };
      // Proficiency weights
      const proficiencyWeights = { beginner: 1, intermediate: 2, advanced: 3 };

      for (const template of templates) {
        let score = 0;
        // Defensive: ensure tags is an array of strings
        const templateTags = Array.isArray(template.tags)
          ? template.tags.filter(t => typeof t === 'string' && t).map(t => t.toLowerCase())
          : [];
        // User tags and skills (for proficiency/recent bonus)
        const userSkills = Array.isArray(tags) ? tags : [];
        const userTags = userSkills.filter(t => typeof t === 'string' && t).map(t => t.toLowerCase());

        // 1. Weighted Tag & Proficiency Matching (with partial/fuzzy match)
        for (const tmplTag of templateTags) {
          // Fuzzy/partial match: check if any user tag contains or is contained by template tag
          const userTagIdx = userTags.findIndex(u => u.includes(tmplTag) || tmplTag.includes(u));
          if (userTagIdx !== -1) {
            // Tag weight
            const tagWeight = tagWeights[tmplTag] || 1;
            // Proficiency (if available)
            let proficiencyWeight = 1;
            if (Array.isArray(userSkills) && typeof userSkills[0] === 'object') {
              // If userSkills is array of objects with skill_name/proficiency_level
              const skillObj = userSkills.find(s => (s.skill_name || '').toLowerCase() === userTags[userTagIdx]);
              if (skillObj && skillObj.proficiency_level) {
                proficiencyWeight = proficiencyWeights[skillObj.proficiency_level] || 1;
              }
            }
            score += tagWeight * proficiencyWeight;
          }
        }

        // 2. Title/Description Matching (bonus for skill in title/desc)
        const titleDesc = ((template.title || '') + ' ' + (template.description || '')).toLowerCase();
        for (const userTag of userTags) {
          if (titleDesc.includes(userTag)) {
            score += 1; // Bonus for title/desc match
          }
        }

        // 3. Negative/Exclusion Tags (penalize for missing required tags)
        const missingTags = templateTags.filter(t => !userTags.includes(t));
        score -= missingTags.length * 0.5; // Penalize lightly for each missing tag

        // 4. Recent Assessment Bonus (if userSkills has updated_at)
        if (Array.isArray(userSkills) && typeof userSkills[0] === 'object') {
          // Bonus for skills assessed in last 7 days
          const now = Date.now();
          for (const skill of userSkills) {
            if (skill.updated_at) {
              const updated = new Date(skill.updated_at).getTime();
              if (!isNaN(updated) && now - updated < 7 * 24 * 60 * 60 * 1000) {
                score += 1;
              }
            }
          }
        }

        if (
          score > maxScore ||
          (score === maxScore && templateTags.length < minTagCount)
        ) {
          maxScore = score;
          bestMatch = template;
          minTagCount = templateTags.length;
        }
      }

      return bestMatch;
    } catch (error) {
      logger.error('Error finding best match template:', error);
      throw error;
    }
  }

  static async getBySourceType(sourceType) {
    try {
      const { data, error } = await db
        .from('roadmap_templates')
        .select('template_id, title, description, source_type, version, created_at, tags')
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

  static async getByCategory(category) {
    try {
      const { data, error } = await db
        .from('roadmap_templates')
        .select('template_id, title, roadmap_data, tags')
        .eq('is_active', true)
        .eq('category', category)
        .order('title', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error(`Error getting templates for category ${category}:`, error);
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
          created_by: templateData.created_by,
          tags: templateData.tags
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
