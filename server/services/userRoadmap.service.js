const db = require('../config/database');
const { supabaseAdmin } = require('../config/database');
const logger = require('../utils/logger');

class UserRoadmapService {
  async createUserRoadmap(userId, templateId, version) {
    try {
      logger.info(`Creating user roadmap for user ${userId}, template ${templateId}, version ${version}`);

      const { data: template, error: templateError } = await db
        .from('roadmap_templates')
        .select('template_id, title, description, source_type, roadmap_data')
        .eq('template_id', templateId)
        .eq('version', version)
        .single();

      if (templateError || !template) {
        throw new Error(`Roadmap template not found: ${templateId} v${version}`);
      }

      const { data: existingRoadmap, error: existingError } = await db
        .from('user_roadmaps')
        .select('user_roadmap_id, status')
        .eq('user_id', userId)
        .eq('template_id', templateId)
        .eq('is_active', true)
        .maybeSingle();

      if (existingRoadmap) {
        throw new Error(`User already has an active roadmap for template ${templateId}`);
      }

      const skills = this.extractSkillsFromTemplate(template.roadmap_data);
      
      if (!skills || skills.length === 0) {
        throw new Error('No skills found in roadmap template');
      }

      const { data: userRoadmap, error: roadmapError } = await db
        .from('user_roadmaps')
        .insert({
          user_id: userId,
          user_id_legacy: Math.floor(Math.random() * 1000000), // Generate random legacy ID
          template_id: templateId,
          roadmap_version: version,
          status: 'not_started',
          progress_percentage: 0,
          is_active: true,
          estimated_completion_date: this.calculateEstimatedCompletion(skills.length)
        })
        .select()
        .single();

      if (roadmapError) {
        throw new Error(`Failed to create user roadmap: ${roadmapError.message}`);
      }

      const modules = [];
      const addedSkillIds = new Set(); // Track skills already added to prevent duplicates
      
      for (let i = 0; i < skills.length; i++) {
        const skill = skills[i];
        
        let { data: skillRecord, error: skillError } = await supabaseAdmin
          .from('Skills')
          .select('skill_id, skill_name')
          .ilike('skill_name', skill.name)
          .maybeSingle();

        if (!skillRecord) {
          const { data: newSkill, error: createError } = await supabaseAdmin
            .from('Skills')
            .insert({ skill_name: skill.name })
            .select()
            .single();

          if (createError) {
            logger.warn(`Failed to create skill ${skill.name}: ${createError.message}`);
            continue;
          }
          skillRecord = newSkill;
        }

        // Skip if this skill is already added to the roadmap
        if (addedSkillIds.has(skillRecord.skill_id)) {
          logger.warn(`Skipping duplicate skill: ${skill.name}`);
          continue;
        }

        addedSkillIds.add(skillRecord.skill_id);
        modules.push({
          user_roadmap_id: userRoadmap.user_roadmap_id,
          skill_id: skillRecord.skill_id,
          module_name: skill.name,
          sequence_order: i + 1,
          status: 'not_started'
        });
      }

      const { data: insertedModules, error: modulesError } = await supabaseAdmin
        .from('user_roadmap_modules')
        .insert(modules)
        .select();

      if (modulesError) {
        logger.error(`Failed to create modules: ${modulesError.message}`);
      }

      logger.info(`Created user roadmap ${userRoadmap.user_roadmap_id} with ${insertedModules?.length || 0} modules`);

      return {
        ...userRoadmap,
        template_title: template.title,
        total_modules: insertedModules?.length || 0,
        modules: insertedModules || []
      };
    } catch (error) {
      logger.error('Error creating user roadmap:', error.message);
      throw error;
    }
  }

  async getUserRoadmap(userRoadmapId, userId) {
    try {
      const { data: roadmap, error: roadmapError } = await db
        .from('user_roadmaps')
        .select('*')
        .eq('user_roadmap_id', userRoadmapId)
        .eq('user_id', userId)
        .single();

      if (roadmapError || !roadmap) {
        throw new Error('User roadmap not found');
      }

      const { data: template } = await db
        .from('roadmap_templates')
        .select('title, description, source_type')
        .eq('template_id', roadmap.template_id)
        .eq('version', roadmap.roadmap_version)
        .single();

      const { data: modules, error: modulesError } = await db
        .from('user_roadmap_modules')
        .select('module_id, skill_id, module_name, sequence_order, status, started_at, completed_at, time_spent_minutes, notes')
        .eq('user_roadmap_id', userRoadmapId)
        .order('sequence_order');

      if (modulesError) {
        logger.warn(`Failed to fetch modules: ${modulesError.message}`);
      }

      const totalModules = modules?.length || 0;
      const completedModules = modules?.filter(m => m.status === 'completed').length || 0;
      const inProgressModules = modules?.filter(m => m.status === 'in_progress').length || 0;

      return {
        ...roadmap,
        template_title: template?.title || 'Unknown',
        template_description: template?.description,
        source_type: template?.source_type,
        modules: modules || [],
        statistics: {
          total_modules: totalModules,
          completed_modules: completedModules,
          in_progress_modules: inProgressModules,
          not_started_modules: totalModules - completedModules - inProgressModules,
          completion_rate: totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0
        }
      };
    } catch (error) {
      logger.error('Error fetching user roadmap:', error.message);
      throw error;
    }
  }

  async getUserRoadmaps(userId, activeOnly = false) {
    try {
      let query = db
        .from('user_roadmaps')
        .select('user_roadmap_id, template_id, roadmap_version, status, progress_percentage, started_at, completed_at, estimated_completion_date, last_activity_at, is_active')
        .eq('user_id', userId)
        .order('last_activity_at', { ascending: false });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data: roadmaps, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch user roadmaps: ${error.message}`);
      }

      const enrichedRoadmaps = await Promise.all(
        (roadmaps || []).map(async (roadmap) => {
          const { data: template } = await db
            .from('roadmap_templates')
            .select('title, description, source_type')
            .eq('template_id', roadmap.template_id)
            .eq('version', roadmap.roadmap_version)
            .maybeSingle();

          const { data: modules } = await db
            .from('user_roadmap_modules')
            .select('status')
            .eq('user_roadmap_id', roadmap.user_roadmap_id);

          const totalModules = modules?.length || 0;
          const completedModules = modules?.filter(m => m.status === 'completed').length || 0;

          return {
            ...roadmap,
            template_title: template?.title || 'Unknown',
            template_description: template?.description,
            source_type: template?.source_type,
            total_modules: totalModules,
            completed_modules: completedModules
          };
        })
      );

      return enrichedRoadmaps;
    } catch (error) {
      logger.error('Error fetching user roadmaps:', error.message);
      throw error;
    }
  }

  async updateModuleStatus(moduleId, userId, status, updates = {}) {
    try {
      const { data: module, error: moduleError } = await db
        .from('user_roadmap_modules')
        .select('module_id, user_roadmap_id, status')
        .eq('module_id', moduleId)
        .single();

      if (moduleError || !module) {
        throw new Error('Module not found');
      }

      const { data: roadmap, error: roadmapError } = await db
        .from('user_roadmaps')
        .select('user_id')
        .eq('user_roadmap_id', module.user_roadmap_id)
        .single();

      if (roadmapError || roadmap.user_id !== userId) {
        throw new Error('Unauthorized access to module');
      }

      const updateData = {
        status,
        updated_at: new Date().toISOString()
      };

      if (updates.notes !== undefined) updateData.notes = updates.notes;
      if (updates.time_spent_minutes !== undefined) updateData.time_spent_minutes = updates.time_spent_minutes;

      // Set timestamps based on status
      if (status === 'in_progress' && !module.started_at) {
        updateData.started_at = new Date().toISOString();
      }
      if (status === 'completed' && !module.completed_at) {
        updateData.completed_at = new Date().toISOString();
      }

      const { data: updatedModule, error: updateError } = await db
        .from('user_roadmap_modules')
        .update(updateData)
        .eq('module_id', moduleId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update module: ${updateError.message}`);
      }

      await this.recalculateProgress(module.user_roadmap_id);

      logger.info(`Updated module ${moduleId} to status: ${status}`);

      return updatedModule;
    } catch (error) {
      logger.error('Error updating module status:', error.message);
      throw error;
    }
  }

  async recalculateProgress(userRoadmapId) {
    try {
      const { data: modules } = await db
        .from('user_roadmap_modules')
        .select('status')
        .eq('user_roadmap_id', userRoadmapId);

      if (!modules || modules.length === 0) {
        return;
      }

      const totalModules = modules.length;
      const completedModules = modules.filter(m => m.status === 'completed').length;
      const progressPercentage = Math.round((completedModules / totalModules) * 100);

      let roadmapStatus = 'in_progress';
      if (completedModules === 0) {
        roadmapStatus = 'not_started';
      } else if (completedModules === totalModules) {
        roadmapStatus = 'completed';
      }

      const updateData = {
        progress_percentage: progressPercentage,
        status: roadmapStatus,
        last_activity_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (roadmapStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      await db
        .from('user_roadmaps')
        .update(updateData)
        .eq('user_roadmap_id', userRoadmapId);

      logger.info(`Updated roadmap ${userRoadmapId} progress: ${progressPercentage}%`);
    } catch (error) {
      logger.error('Error recalculating progress:', error.message);
    }
  }

  async checkForVersionUpdates(userRoadmapId) {
    try {
      const { data: roadmap, error: roadmapError } = await db
        .from('user_roadmaps')
        .select('user_roadmap_id, user_id, template_id, roadmap_version')
        .eq('user_roadmap_id', userRoadmapId)
        .single();

      if (roadmapError || !roadmap) {
        throw new Error('User roadmap not found');
      }

      const { data: latestTemplate, error: latestError } = await db
        .from('roadmap_templates')
        .select('version, data')
        .eq('template_id', roadmap.template_id)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (latestError || !latestTemplate) {
        logger.info(`No newer version found for template ${roadmap.template_id}`);
        return null;
      }

      if (latestTemplate.version === roadmap.roadmap_version) {
        logger.info('User is on latest version');
        return null;
      }

      const { data: existingNotification } = await db
        .from('roadmap_version_updates')
        .select('update_id')
        .eq('user_roadmap_id', userRoadmapId)
        .eq('new_version', latestTemplate.version)
        .eq('user_response', 'pending')
        .maybeSingle();

      if (existingNotification) {
        logger.info('Version update notification already exists');
        return existingNotification;
      }

      const impactAnalysis = await this.calculateVersionImpact(
        roadmap.template_id,
        roadmap.roadmap_version,
        latestTemplate.version
      );

      const { data: notification, error: notificationError } = await db
        .from('roadmap_version_updates')
        .insert({
          user_roadmap_id: userRoadmapId,
          old_version: roadmap.roadmap_version,
          new_version: latestTemplate.version,
          update_type: this.determineUpdateType(roadmap.roadmap_version, latestTemplate.version),
          changes_summary: impactAnalysis.summary,
          changes_detail: impactAnalysis.changes,
          impact_analysis: impactAnalysis.impact,
          user_response: 'pending'
        })
        .select()
        .single();

      if (notificationError) {
        throw new Error(`Failed to create notification: ${notificationError.message}`);
      }

      logger.info(`Created version update notification: ${roadmap.roadmap_version} → ${latestTemplate.version}`);

      return notification;
    } catch (error) {
      logger.error('Error checking for version updates:', error.message);
      throw error;
    }
  }

  async respondToVersionUpdate(updateId, userId, response) {
    try {
      const { data: update, error: updateError } = await db
        .from('roadmap_version_updates')
        .select('update_id, user_roadmap_id, new_version')
        .eq('update_id', updateId)
        .single();

      if (updateError || !update) {
        throw new Error('Update notification not found');
      }

      const { data: roadmap } = await db
        .from('user_roadmaps')
        .select('user_id')
        .eq('user_roadmap_id', update.user_roadmap_id)
        .single();

      if (!roadmap || roadmap.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      const updateData = {
        user_response: response,
        responded_at: new Date().toISOString()
      };

      if (response === 'accepted') {
        updateData.applied_at = new Date().toISOString();
        
        await db
          .from('user_roadmaps')
          .update({ 
            roadmap_version: update.new_version,
            updated_at: new Date().toISOString()
          })
          .eq('user_roadmap_id', update.user_roadmap_id);

        logger.info(`Applied version update: roadmap ${update.user_roadmap_id} → v${update.new_version}`);
      }

      const { data: updatedNotification, error } = await db
        .from('roadmap_version_updates')
        .update(updateData)
        .eq('update_id', updateId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update notification: ${error.message}`);
      }

      return updatedNotification;
    } catch (error) {
      logger.error('Error responding to version update:', error.message);
      throw error;
    }
  }

  async deleteUserRoadmap(userRoadmapId, userId) {
    try {
      const { data: roadmap } = await db
        .from('user_roadmaps')
        .select('user_id')
        .eq('user_roadmap_id', userRoadmapId)
        .single();

      if (!roadmap || roadmap.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      const { error } = await db
        .from('user_roadmaps')
        .update({ 
          is_active: false,
          status: 'archived',
          updated_at: new Date().toISOString()
        })
        .eq('user_roadmap_id', userRoadmapId);

      if (error) {
        throw new Error(`Failed to archive roadmap: ${error.message}`);
      }

      logger.info(`Archived user roadmap ${userRoadmapId}`);
      return true;
    } catch (error) {
      logger.error('Error deleting user roadmap:', error.message);
      throw error;
    }
  }

  extractSkillsFromTemplate(templateData) {
    try {
      if (!templateData) return [];

      // Handle nodes/edges structure (from roadmap.sh)
      if (templateData.nodes && Array.isArray(templateData.nodes)) {
        const skills = [];
        templateData.nodes.forEach((node, index) => {
          if (node.type === 'topic' || node.type === 'subtopic') {
            skills.push({
              name: node.data?.label || node.id,
              order: index + 1
            });
          }
        });
        if (skills.length > 0) return skills;
      }

      // Handle flat skills array
      if (Array.isArray(templateData.skills)) {
        return templateData.skills.map((skill, index) => ({
          name: typeof skill === 'string' ? skill : skill.name || skill.skill_name,
          order: index + 1
        }));
      }

      // Handle modules structure
      if (Array.isArray(templateData.modules)) {
        return templateData.modules.flatMap((module, moduleIndex) => {
          if (Array.isArray(module.skills)) {
            return module.skills.map((skill, skillIndex) => ({
              name: typeof skill === 'string' ? skill : skill.name || skill.skill_name,
              order: (moduleIndex * 100) + skillIndex + 1
            }));
          }
          return [];
        });
      }

      return [];
    } catch (error) {
      logger.error('Error extracting skills from template:', error.message);
      return [];
    }
  }

  calculateEstimatedCompletion(skillCount, hoursPerSkill = 4) {
    const totalHours = skillCount * hoursPerSkill;
    const hoursPerWeek = 10; // Assume 10 hours/week study time
    const weeksNeeded = Math.ceil(totalHours / hoursPerWeek);
    
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + (weeksNeeded * 7));
    
    return estimatedDate.toISOString().split('T')[0]; // Return YYYY-MM-DD
  }

  async calculateVersionImpact(templateId, oldVersion, newVersion) {
    try {
      const { data: oldTemplate } = await db
        .from('roadmap_templates')
        .select('roadmap_data')
        .eq('template_id', templateId)
        .eq('version', oldVersion)
        .single();

      const { data: newTemplate } = await db
        .from('roadmap_templates')
        .select('roadmap_data')
        .eq('template_id', templateId)
        .eq('version', newVersion)
        .single();

      if (!oldTemplate || !newTemplate) {
        return { summary: 'Version comparison unavailable', changes: [], impact: {} };
      }

      const oldSkills = this.extractSkillsFromTemplate(oldTemplate.roadmap_data).map(s => s.name);
      const newSkills = this.extractSkillsFromTemplate(newTemplate.roadmap_data).map(s => s.name);

      const added = newSkills.filter(s => !oldSkills.includes(s));
      const removed = oldSkills.filter(s => !newSkills.includes(s));
      const unchanged = oldSkills.filter(s => newSkills.includes(s));

      const changes = [
        ...added.map(skill => ({ type: 'added', skill, reason: 'New skill added' })),
        ...removed.map(skill => ({ type: 'removed', skill, reason: 'Skill deprecated' }))
      ];

      const timeDelta = (added.length - removed.length) * 4; // 4 hours per skill

      return {
        summary: `${added.length} skills added, ${removed.length} removed, ${unchanged.length} unchanged`,
        changes,
        impact: {
          modules_added: added.length,
          modules_removed: removed.length,
          time_delta_hours: timeDelta,
          affected_skills: [...added, ...removed]
        }
      };
    } catch (error) {
      logger.error('Error calculating version impact:', error.message);
      return { summary: 'Error calculating impact', changes: [], impact: {} };
    }
  }

  determineUpdateType(oldVersion, newVersion) {
    const oldParts = oldVersion.split('.').map(Number);
    const newParts = newVersion.split('.').map(Number);

    if (newParts[0] > oldParts[0]) return 'major';
    if (newParts[1] > oldParts[1]) return 'minor';
    return 'patch';
  }
}

module.exports = new UserRoadmapService();