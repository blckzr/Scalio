const supabase = require('../config/database');
const { validateRoadmapStructure } = require('../utils/roadmapValidator');
const logger = require('../utils/logger');

/**
 * Import roadmap from roadmap.sh format
 * Stores as versioned template in roadmap_templates table
 */
const importRoadmap = async (roadmapData) => {
  const {
    title,
    description,
    category,
    roadmap_data,
    source_type,
    source_url,
    created_by
  } = roadmapData;

  try {
    // Validate roadmap structure first
    const validation = validateRoadmapStructure(roadmap_data);
    
    if (!validation.valid) {
      return { 
        error: 'Invalid roadmap structure', 
        details: validation.errors 
      };
    }

    // Check if a roadmap with the same title already exists
    const { data: existingRoadmap, error: checkError } = await supabase
      .from('roadmap_templates')
      .select('template_id, version')
      .eq('title', title)
      .order('version', { ascending: false })
      .limit(1);

    if (checkError) {
      logger.error(`Database error checking existing roadmap: ${checkError.message}`);
      return { error: 'Database error', details: checkError };
    }

    // Determine version number
    const version = existingRoadmap && existingRoadmap.length > 0 
      ? (parseFloat(existingRoadmap[0].version) + 0.1).toFixed(1)
      : '1.0';

    // Insert roadmap template
    const { data: roadmapTemplate, error: insertError } = await supabase
      .from('roadmap_templates')
      .insert({
        title,
        description,
        category,
        roadmap_data,
        source_type,
        source_url,
        version,
        created_by,
        is_active: true,
        industry_verified: false,
        verification_score: 0
      })
      .select()
      .single();

    if (insertError) {
      logger.error(`Failed to insert roadmap: ${insertError.message}`);
      return { error: 'Failed to insert roadmap', details: insertError };
    }

    // Extract and store skills from roadmap
    const skillsResult = await extractAndStoreSkills(
      roadmapTemplate.template_id,
      roadmap_data
    );

    if (skillsResult.error) {
      logger.warn(`Skill extraction had issues: ${skillsResult.error}`);
      // Don't fail the entire import, just log the warning
    }

    logger.success(`Roadmap imported: ${title} v${version} (ID: ${roadmapTemplate.template_id})`);
    logger.info(`Extracted ${skillsResult.skillsAdded || 0} unique skills`);

    return {
      data: {
        roadmap_id: roadmapTemplate.template_id,
        title: roadmapTemplate.title,
        version: roadmapTemplate.version,
        skills_extracted: skillsResult.skillsAdded || 0,
        validation_stats: validation.stats,
        warnings: validation.warnings
      }
    };

  } catch (error) {
    logger.error(`Import roadmap service error: ${error.message}`);
    return { error: 'Internal service error', details: error.message };
  }
};

/**
 * Extract skills from roadmap nodes (topics and subtopics)
 */
const extractAndStoreSkills = async (templateId, roadmapData) => {
  try {
    const skills = new Set();

    // Extract from nodes with type 'topic' or 'subtopic'
    if (Array.isArray(roadmapData.nodes)) {
      roadmapData.nodes.forEach(node => {
        if (['topic', 'subtopic'].includes(node.type) && node.data?.label) {
          skills.add(node.data.label.trim());
        }
      });
    }

    if (skills.size === 0) {
      return { skillsAdded: 0, warning: 'No skills found in roadmap' };
    }

    // Store skills in Skills table and link to roadmap
    let skillsAdded = 0;
    const skillLinks = [];
    let sequenceOrder = 1;

    for (const skillName of skills) {
      // Check if skill already exists
      const { data: existingSkill } = await supabase
        .from('Skills')
        .select('skill_id')
        .eq('skill_name', skillName)
        .single();

      let skillId;

      if (existingSkill) {
        skillId = existingSkill.skill_id;
      } else {
        // Insert new skill
        const { data: newSkill, error: skillError } = await supabase
          .from('Skills')
          .insert({ skill_name: skillName, skill_category: 'technical' })
          .select('skill_id')
          .single();

        if (skillError) {
          logger.error(`Failed to insert skill "${skillName}": ${skillError.message}`);
          continue;
        }

        skillId = newSkill.skill_id;
        skillsAdded++;
      }

      // Link skill to roadmap template
      skillLinks.push({
        template_id: templateId,
        skill_id: skillId,
        sequence_order: sequenceOrder++,
        is_required: true,
        is_deprecated: false
      });
    }

    // Bulk insert skill links
    if (skillLinks.length > 0) {
      const { error: linkError } = await supabase
        .from('roadmap_skills')
        .insert(skillLinks);

      if (linkError) {
        logger.error(`Failed to link skills: ${linkError.message}`);
        return { error: 'Failed to link skills', skillsAdded };
      }
    }

    return { skillsAdded: skillsAdded, totalSkills: skills.size };

  } catch (error) {
    logger.error(`Extract skills error: ${error.message}`);
    return { error: error.message };
  }
};

/**
 * Get import history with pagination and filters
 */
const getImportHistory = async (options = {}) => {
  const { page = 1, limit = 20, source_type, category } = options;
  const offset = (page - 1) * limit;

  try {
    let query = supabase
      .from('roadmap_templates')
      .select('template_id, title, category, version, source_type, source_url, created_by, created_at, is_active', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (source_type) {
      query = query.eq('source_type', source_type);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error, count } = await query;

    if (error) {
      logger.error(`Failed to fetch import history: ${error.message}`);
      return { error: 'Failed to fetch history', details: error };
    }

    return {
      data: {
        imports: data,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    };

  } catch (error) {
    logger.error(`Get import history error: ${error.message}`);
    return { error: 'Internal service error' };
  }
};

/**
 * Just validate without importing
 */
const validateOnly = (roadmapData) => {
  return validateRoadmapStructure(roadmapData);
};

module.exports = {
  importRoadmap,
  getImportHistory,
  validateOnly
};
