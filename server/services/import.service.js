const { supabaseAdmin: supabase } = require('../config/database');
const { validateRoadmapStructure } = require('../utils/roadmapValidator');
const logger = require('../utils/logger');
const marketService = require('./market.service');

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

    const tags = [...new Set([
      ...(roadmap_data.tags || []),
      category,
      ...Object.values(roadmap_data.nodes || {}).map(node => node.data?.label).filter(Boolean)
    ])];

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
        verification_score: 0,
        tags
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

const validateOnly = (roadmapData) => {
  return validateRoadmapStructure(roadmapData);
};

 const analyzeRoadmapIntelligence = async (roadmapData) => {
  try {
    logger.info('Running Intelligence Layer analysis on roadmap...');

    // Extract skills from roadmap
    const skills = new Set();
    if (Array.isArray(roadmapData.nodes)) {
      roadmapData.nodes.forEach(node => {
        if (['topic', 'subtopic'].includes(node.type) && node.data?.label) {
          skills.add(node.data.label.trim());
        }
      });
    }

    if (skills.size === 0) {
      return {
        insights: [],
        summary: {
          total_skills: 0,
          high_demand: 0,
          moderate_demand: 0,
          low_demand: 0,
          legacy_candidates: 0,
          emerging_skills: 0
        },
        recommendations: ['No skills found in roadmap to analyze']
      };
    }

    // Analyze each skill against market data
    const insights = [];
    let highDemand = 0;
    let moderateDemand = 0;
    let lowDemand = 0;
    let legacyCandidates = 0;
    let emergingSkills = 0;

    for (const skillName of skills) {
      try {
        // Check if we have market data for this skill
        const { data: skillDemand, error } = await supabase
          .from('skill_demand')
          .select('*')
          .ilike('skill_name', skillName)
          .order('last_updated', { ascending: false })
          .limit(1)
          .single();

        if (error || !skillDemand) {
          // No market data available
          insights.push({
            skill: skillName,
            status: 'unknown',
            demand_score: null,
            job_count: null,
            avg_salary: null,
            recommendation: 'No market data available. Consider researching current demand.',
            priority: 'medium',
            icon: '❓'
          });
          continue;
        }

        // Analyze demand level
        const demandScore = skillDemand.demand_score || 0;
        const jobCount = skillDemand.job_count || 0;
        let status, recommendation, priority, icon;

        if (demandScore >= 70 && jobCount >= 50) {
          status = 'high_demand';
          recommendation = `HIGH DEMAND - Keep as core skill. ${jobCount} jobs available with ${demandScore}/100 demand score.`;
          priority = 'high';
          highDemand++;
        } else if (demandScore >= 40 && jobCount >= 20) {
          status = 'moderate_demand';
          recommendation = `MODERATE DEMAND - Good to include. ${jobCount} jobs available.`;
          priority = 'medium';
          moderateDemand++;
        } else if (demandScore >= 20 || jobCount >= 10) {
          status = 'low_demand';
          recommendation = `LOW DEMAND - Consider as optional or advanced skill. Only ${jobCount} jobs found.`;
          priority = 'medium';
          lowDemand++;
        } else {
          status = 'legacy';
          recommendation = `LEGACY CANDIDATE - Very low demand detected (${jobCount} jobs, ${demandScore}/100 score). Recommend marking as deprecated or removing.`;
          priority = 'high';
          legacyCandidates++;
        }

        // Check for emerging skills (high demand but low historical data)
        const dataAge = skillDemand.last_updated 
          ? Math.floor((Date.now() - new Date(skillDemand.last_updated)) / (1000 * 60 * 60 * 24))
          : 999;

        if (demandScore >= 60 && dataAge <= 30) {
          status = 'emerging';
          recommendation = `EMERGING SKILL - High current demand (${demandScore}/100). Consider highlighting as trending.`;
          priority = 'high';
          emergingSkills++;
        }

        insights.push({
          skill: skillName,
          status,
          demand_score: demandScore,
          job_count: jobCount,
          avg_salary: skillDemand.avg_salary || null,
          trend: skillDemand.trend || 'stable',
          last_updated: skillDemand.last_updated,
          recommendation,
          priority,
          icon,
          data_sources: skillDemand.data_sources || []
        });

      } catch (skillError) {
        logger.error(`Error analyzing skill "${skillName}":`, skillError);
        insights.push({
          skill: skillName,
          status: 'error',
          recommendation: 'Error fetching market data',
          priority: 'low',
        });
      }
    }

    // Sort insights by priority (high first) and demand score
    insights.sort((a, b) => {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return (b.demand_score || 0) - (a.demand_score || 0);
    });

    // Generate summary recommendations
    const recommendations = [];

    if (legacyCandidates > 0) {
      recommendations.push(
        `${legacyCandidates} skill(s) show very low market demand. Consider removing or marking as legacy.`
      );
    }

    if (emergingSkills > 0) {
      recommendations.push(
        `${emergingSkills} emerging skill(s) detected with high demand. Consider highlighting these.`
      );
    }

    if (highDemand > moderateDemand + lowDemand + legacyCandidates) {
      recommendations.push(
        'Excellent! Majority of skills are in high demand. This roadmap aligns well with current market needs.'
      );
    } else if (lowDemand + legacyCandidates > highDemand) {
      recommendations.push(
        'Warning: Many skills show low demand. Consider updating this roadmap with more current technologies.'
      );
    }

    if (insights.filter(i => i.status === 'unknown').length > 5) {
      recommendations.push(
        'Many skills lack market data. Consider running market aggregation for better insights.'
      );
    }

    return {
      insights,
      summary: {
        total_skills: skills.size,
        high_demand: highDemand,
        moderate_demand: moderateDemand,
        low_demand: lowDemand,
        legacy_candidates: legacyCandidates,
        emerging_skills: emergingSkills,
        analyzed_at: new Date().toISOString()
      },
      recommendations
    };

  } catch (error) {
    logger.error('Intelligence analysis error:', error);
    return {
      error: 'Failed to analyze roadmap intelligence',
      details: error.message
    };
  }
};

const importWithIntelligence = async (roadmapData) => {
  try {
    // Step 1: Validate structure
    const validation = validateRoadmapStructure(roadmapData.roadmap_data);
    if (!validation.valid) {
      return { 
        error: 'Invalid roadmap structure', 
        details: validation.errors 
      };
    }

    // Step 2: Run Intelligence Layer analysis
    const intelligence = await analyzeRoadmapIntelligence(roadmapData.roadmap_data);

    // Step 3: Import roadmap (mark as unpublished initially)
    const importResult = await importRoadmap({
      ...roadmapData,
      is_active: false // Don't publish yet, wait for admin review
    });

    if (importResult.error) {
      return importResult;
    }

    // Return both import data and intelligence insights
    return {
      data: {
        ...importResult.data,
        intelligence,
        status: 'pending_review',
        message: 'Roadmap imported successfully. Review intelligence insights before publishing.'
      }
    };

  } catch (error) {
    logger.error('Import with intelligence error:', error);
    return { error: 'Failed to import with intelligence', details: error.message };
  }
};

const publishRoadmap = async (templateId, adminOverrides = {}) => {
  try {
    const { data, error } = await supabase
      .from('roadmap_templates')
      .update({
        is_active: true,
        admin_notes: adminOverrides.notes || null,
        verified_at: new Date().toISOString()
      })
      .eq('template_id', templateId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to publish roadmap:', error);
      return { error: 'Failed to publish roadmap', details: error };
    }

    if (adminOverrides.skill_changes && Array.isArray(adminOverrides.skill_changes)) {
      for (const change of adminOverrides.skill_changes) {
        if (change.mark_as_deprecated && change.skill_id) {
          await supabase
            .from('roadmap_skills')
            .update({ is_deprecated: true })
            .eq('template_id', templateId)
            .eq('skill_id', change.skill_id);
        }
        if (change.mark_as_optional && change.skill_id) {
          await supabase
            .from('roadmap_skills')
            .update({ is_required: false })
            .eq('template_id', templateId)
            .eq('skill_id', change.skill_id);
        }
      }
    }

    logger.success(`Roadmap published: ${data.title} (ID: ${templateId})`);

    return {
      data: {
        template_id: data.template_id,
        title: data.title,
        version: data.version,
        status: 'published',
        published_at: data.verified_at
      }
    };

  } catch (error) {
    logger.error('Publish roadmap error:', error);
    return { error: 'Internal service error', details: error.message };
  }
};

module.exports = {
  importRoadmap,
  getImportHistory,
  validateOnly,
  analyzeRoadmapIntelligence,
  importWithIntelligence,
  publishRoadmap
};