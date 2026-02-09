const db = require('../config/database');
const { supabaseAdmin } = require('../config/database');
const logger = require('../utils/logger');
const aiService = require('./ai.service');

class RoadmapVersionService {
  async checkForUpdates(user_id, roadmap_id) {
    try {
      // Get user's current roadmap version
      const { data: userRoadmap, error: roadmapError } = await db
        .from('user_roadmaps')
        .select('template_id, version, created_at')
        .eq('user_roadmap_id', roadmap_id)
        .eq('user_id', user_id)
        .single();

      if (roadmapError) throw roadmapError;

      if (!userRoadmap || !userRoadmap.template_id) {
        return {
          updates_available: false,
          message: 'No template associated with this roadmap'
        };
      }

      // Get latest template version
      const { data: latestTemplate, error: templateError } = await supabaseAdmin
        .from('roadmap_templates')
        .select('version, title, updated_at')
        .eq('template_id', userRoadmap.template_id)
        .eq('is_active', true)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (templateError) throw templateError;

      const currentVersion = userRoadmap.version;
      const latestVersion = latestTemplate.version;

      // Compare versions
      const updateAvailable = this.isNewerVersion(latestVersion, currentVersion);

      if (!updateAvailable) {
        return {
          updates_available: false,
          current_version: currentVersion,
          latest_version: latestVersion,
          message: 'Your roadmap is up to date!'
        };
      }

      // Get changelog between versions
      const changelog = await this.getChangelogBetweenVersions(
        userRoadmap.template_id,
        currentVersion,
        latestVersion
      );

      return {
        updates_available: true,
        current_version: currentVersion,
        latest_version: latestVersion,
        template_id: userRoadmap.template_id,
        template_title: latestTemplate.title,
        changelog: changelog || [],
        recommendation: 'Review changes and decide to accept or reject'
      };

    } catch (error) {
      logger.error('Error checking for updates:', error);
      throw error;
    }
  }

  async compareVersions(user_id, roadmap_id, new_version) {
    try {
      // Get current roadmap
      const { data: userRoadmap, error } = await db
        .from('user_roadmaps')
        .select('template_id, version')
        .eq('user_roadmap_id', roadmap_id)
        .eq('user_id', user_id)
        .single();

      if (error) throw error;

      // Get both template versions
      const { data: templates, error: templatesError } = await supabaseAdmin
        .from('roadmap_templates')
        .select('version, roadmap_data')
        .eq('template_id', userRoadmap.template_id)
        .in('version', [userRoadmap.version, new_version]);

      if (templatesError) throw templatesError;

      const oldTemplate = templates.find(t => t.version === userRoadmap.version);
      const newTemplate = templates.find(t => t.version === new_version);

      if (!oldTemplate || !newTemplate) {
        throw new Error('Template versions not found');
      }

      // Extract and compare skills
      const oldSkills = this.extractSkills(oldTemplate.roadmap_data);
      const newSkills = this.extractSkills(newTemplate.roadmap_data);

      const comparison = this.calculateDifferences(oldSkills, newSkills);

      // Get user's current progress
      const progress = await this.getUserProgress(user_id, roadmap_id);

      // Calculate impact
      const impact = await this.calculateImpact(comparison, progress);

      return {
        old_version: userRoadmap.version,
        new_version: new_version,
        comparison,
        impact,
        user_progress: progress
      };

    } catch (error) {
      logger.error('Error comparing versions:', error);
      throw error;
    }
  }

  async getUpdateRecommendation(user_id, roadmap_id, new_version) {
    try {
      const comparison = await this.compareVersions(user_id, roadmap_id, new_version);

      // Use AI to analyze and provide recommendation
      const prompt = `Analyze this roadmap update and provide a recommendation:

CURRENT VERSION: ${comparison.old_version}
NEW VERSION: ${new_version}

USER PROGRESS: ${comparison.user_progress.progress_percentage}% complete

CHANGES:
- Skills Added: ${comparison.comparison.skills_added.length}
- Skills Removed: ${comparison.comparison.skills_removed.length}
- Skills Updated: ${comparison.comparison.skills_updated.length}

IMPACT:
- Additional Time Required: ${comparison.impact.estimated_additional_weeks} weeks
- Modules Affected: ${comparison.impact.modules_affected}

Should the user accept this update? Provide:
1. Clear recommendation (accept/reject/partial)
2. Reasoning (why or why not)
3. Migration plan if accepted
4. What to watch out for

Return as JSON:
{
  "recommendation": "accept|reject|partial",
  "confidence": "high|medium|low",
  "reasoning": "detailed explanation",
  "pros": ["benefit1", "benefit2"],
  "cons": ["drawback1", "drawback2"],
  "migration_plan": "step by step plan",
  "estimated_disruption": "low|medium|high",
  "alternative_suggestion": "optional alternative approach"
}`;

      const aiRecommendation = await aiService.complete(prompt, {
        model: 'gemini-2.0-flash-exp',
        temperature: 0.6,
        parseJSON: true
      });

      return {
        ...comparison,
        ai_recommendation: aiRecommendation
      };

    } catch (error) {
      logger.error('Error getting AI recommendation:', error);
      throw error;
    }
  }

  async acceptUpdate(user_id, roadmap_id, new_version) {
    try {
      logger.info(`User ${user_id} accepting roadmap update to v${new_version}`);

      // Get comparison data
      const comparison = await this.compareVersions(user_id, roadmap_id, new_version);

      // Create migration record
      const { data: migration, error: migrationError } = await supabaseAdmin
        .from('version_migrations')
        .insert({
          user_id,
          roadmap_id,
          template_id: comparison.template_id,
          from_version: comparison.old_version,
          to_version: new_version,
          migration_type: 'upgrade',
          skills_added: comparison.comparison.skills_added,
          skills_removed: comparison.comparison.skills_removed,
          skills_updated: comparison.comparison.skills_updated,
          estimated_additional_weeks: comparison.impact.estimated_additional_weeks,
          migration_status: 'in_progress',
          applied_at: new Date().toISOString()
        })
        .select()
        .single();

      if (migrationError) throw migrationError;

      // Update user_roadmaps table with new version
      const { error: updateError } = await db
        .from('user_roadmaps')
        .update({
          version: new_version,
          updated_at: new Date().toISOString()
        })
        .eq('user_roadmap_id', roadmap_id)
        .eq('user_id', user_id);

      if (updateError) throw updateError;

      // Update migration status
      await supabaseAdmin
        .from('version_migrations')
        .update({
          migration_status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('migration_id', migration.migration_id);

      // Create notification
      await this.createMigrationNotification(user_id, roadmap_id, {
        type: 'migration_complete',
        old_version: comparison.old_version,
        new_version: new_version,
        changes: comparison.comparison
      });

      logger.info(`Migration completed for roadmap ${roadmap_id}`);

      return {
        success: true,
        migration_id: migration.migration_id,
        old_version: comparison.old_version,
        new_version: new_version,
        changes_applied: comparison.comparison,
        message: 'Roadmap successfully updated!'
      };

    } catch (error) {
      logger.error('Error accepting update:', error);
      
      if (error.migration_id) {
        await supabaseAdmin
          .from('version_migrations')
          .update({
            migration_status: 'failed',
            error_message: error.message
          })
          .eq('migration_id', error.migration_id);
      }

      throw error;
    }
  }

  async rejectUpdate(user_id, roadmap_id, new_version, reason = null) {
    try {
      logger.info(`User ${user_id} rejecting roadmap update to v${new_version}`);

      await this.createMigrationNotification(user_id, roadmap_id, {
        type: 'version_available',
        action: 'rejected',
        new_version: new_version,
        reason: reason
      });

      const { error } = await supabaseAdmin
        .from('roadmap_notifications')
        .update({
          action_taken: 'rejected',
          action_taken_at: new Date().toISOString(),
          is_read: true
        })
        .eq('user_id', user_id)
        .eq('roadmap_id', roadmap_id)
        .eq('new_version', new_version)
        .eq('notification_type', 'version_available');

      if (error) logger.warn('Error updating notification:', error);

      return {
        success: true,
        message: 'Update rejected. You can always update later.',
        reason: reason
      };

    } catch (error) {
      logger.error('Error rejecting update:', error);
      throw error;
    }
  }

  async getMigrationHistory(user_id, roadmap_id) {
    try {
      const { data, error } = await supabaseAdmin
        .from('version_migrations')
        .select('*')
        .eq('user_id', user_id)
        .eq('roadmap_id', roadmap_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];

    } catch (error) {
      logger.error('Error getting migration history:', error);
      throw error;
    }
  }

  // Helper Methods

  isNewerVersion(version1, version2) {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);

    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1 = v1Parts[i] || 0;
      const v2 = v2Parts[i] || 0;
      
      if (v1 > v2) return true;
      if (v1 < v2) return false;
    }

    return false;
  }

  extractSkills(roadmapData) {
    if (!roadmapData || !roadmapData.nodes) return [];

    return roadmapData.nodes
      .filter(node => node.type === 'topic' || node.type === 'subtopic')
      .map(node => ({
        id: node.id,
        name: node.data?.label || node.id,
        type: node.type,
        description: node.data?.description
      }));
  }

  calculateDifferences(oldSkills, newSkills) {
    const oldSkillNames = new Set(oldSkills.map(s => s.name.toLowerCase()));
    const newSkillNames = new Set(newSkills.map(s => s.name.toLowerCase()));

    const skills_added = newSkills.filter(s => !oldSkillNames.has(s.name.toLowerCase()));
    const skills_removed = oldSkills.filter(s => !newSkillNames.has(s.name.toLowerCase()));
    const skills_updated = newSkills.filter(s => {
      const oldSkill = oldSkills.find(old => old.name.toLowerCase() === s.name.toLowerCase());
      return oldSkill && oldSkill.description !== s.description;
    });

    return {
      skills_added: skills_added.map(s => s.name),
      skills_removed: skills_removed.map(s => s.name),
      skills_updated: skills_updated.map(s => s.name),
      total_changes: skills_added.length + skills_removed.length + skills_updated.length
    };
  }

  async getUserProgress(user_id, roadmap_id) {
    const { data, error } = await supabaseAdmin
      .from('roadmap_progress')
      .select('*')
      .eq('user_id', user_id)
      .eq('roadmap_id', roadmap_id)
      .single();

    if (error || !data) {
      return {
        progress_percentage: 0,
        modules_completed: 0,
        total_modules: 0
      };
    }

    return data;
  }

  async calculateImpact(comparison, progress) {
    const { skills_added, skills_removed } = comparison;

    // Estimate 2 weeks per new skill
    const estimated_additional_weeks = skills_added.length * 2;

    // Calculate modules affected
    const modules_affected = skills_added.length + skills_removed.length;

    return {
      estimated_additional_weeks,
      modules_affected,
      progress_impact: modules_affected > 0 ? 'medium' : 'low',
      recommendation: progress.progress_percentage < 50 ? 'accept' : 'review_carefully'
    };
  }

  async getChangelogBetweenVersions(template_id, from_version, to_version) {
    const { data, error } = await supabaseAdmin
      .from('roadmap_version_changelog')
      .select('*')
      .eq('template_id', template_id)
      .eq('from_version', from_version)
      .eq('to_version', to_version)
      .order('published_at', { ascending: false });

    if (error) {
      logger.warn('Error fetching changelog:', error);
      return [];
    }

    return data || [];
  }

  async createMigrationNotification(user_id, roadmap_id, details) {
    try {
      await supabaseAdmin
        .from('roadmap_notifications')
        .insert({
          user_id,
          roadmap_id,
          notification_type: details.type,
          old_version: details.old_version,
          new_version: details.new_version,
          title: this.getNotificationTitle(details.type),
          message: this.getNotificationMessage(details),
          changes_summary: details.changes || {},
          action_required: details.type === 'version_available'
        });

      logger.info('Migration notification created');
    } catch (error) {
      logger.error('Error creating notification:', error);
    }
  }

  getNotificationTitle(type) {
    const titles = {
      'version_available': 'New Roadmap Version Available',
      'migration_complete': 'Roadmap Updated Successfully',
      'migration_failed': 'Roadmap Update Failed',
      'breaking_change': 'Breaking Changes Detected'
    };

    return titles[type] || 'Roadmap Update';
  }

  getNotificationMessage(details) {
    const { type, old_version, new_version, changes } = details;

    if (type === 'migration_complete') {
      return `Your roadmap has been successfully updated from v${old_version} to v${new_version}. ${changes?.skills_added?.length || 0} new skills added!`;
    }

    if (type === 'version_available') {
      return `A new version (v${new_version}) is available for your roadmap. Review changes and decide to update.`;
    }

    return 'Roadmap update notification';
  }
}

module.exports = new RoadmapVersionService();