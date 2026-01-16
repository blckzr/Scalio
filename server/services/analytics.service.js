const db = require('../config/database');
const { supabaseAdmin } = require('../config/database');
const logger = require('../utils/logger');

class AnalyticsService {
  async getUserAnalytics(userId) {
    try {
      const { data: progressRecords, error: progressError } = await db
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (progressError) throw progressError;

      // Get skills count
      const { data: skills, error: skillsError } = await db
        .from('user_skills')
        .select('proficiency_level')
        .eq('user_id', userId);

      if (skillsError) throw skillsError;

      // Get roadmap progress
      const { data: roadmaps, error: roadmapError } = await db
        .from('user_roadmaps')
        .select('status')
        .eq('user_id', userId);

      if (roadmapError) throw roadmapError;

      // Calculate statistics
      const totalActivities = progressRecords?.length || 0;
      const completedMilestones = progressRecords?.filter(p => 
        p.progress_type === 'milestone_completed' && p.completed_at
      ).length || 0;
      
      const completedResources = progressRecords?.filter(p => 
        p.progress_type === 'resource_completed' && p.completed_at
      ).length || 0;

      const totalTimeSpent = progressRecords?.reduce((sum, p) => 
        sum + (p.time_spent_minutes || 0), 0
      ) || 0;

      const skillDistribution = {
        beginner: skills?.filter(s => s.proficiency_level === 'beginner').length || 0,
        intermediate: skills?.filter(s => s.proficiency_level === 'intermediate').length || 0,
        advanced: skills?.filter(s => s.proficiency_level === 'advanced').length || 0
      };

      const roadmapStats = {
        active: roadmaps?.filter(r => r.status === 'in-progress').length || 0,
        completed: roadmaps?.filter(r => r.status === 'completed').length || 0,
        total: roadmaps?.length || 0
      };

      // Recent activities (last 10)
      const recentActivities = progressRecords?.slice(0, 10).map(p => ({
        type: p.progress_type,
        completion_percentage: p.completion_percentage,
        time_spent_minutes: p.time_spent_minutes,
        completed_at: p.completed_at,
        created_at: p.created_at
      })) || [];

      logger.info(`Generated analytics for user ${userId}`);

      return {
        overview: {
          total_activities: totalActivities,
          milestones_completed: completedMilestones,
          resources_completed: completedResources,
          total_time_spent_hours: Math.round(totalTimeSpent / 60),
          skills_assessed: skills?.length || 0
        },
        skill_distribution: skillDistribution,
        roadmap_stats: roadmapStats,
        recent_activities: recentActivities
      };
    } catch (error) {
      logger.error(`Error getting analytics for user ${userId}:`, error);
      throw error;
    }
  }

  async getRoadmapProgress(userId, roadmapId) {
    try {
      // Get roadmap details
      const { data: roadmap, error: roadmapError } = await db
        .from('Roadmaps')
        .select(`
          roadmap_id,
          roadmap_title,
          difficulty_level,
          estimated_duration_weeks
        `)
        .eq('roadmap_id', roadmapId)
        .single();

      if (roadmapError || !roadmap) {
        throw new Error('Roadmap not found');
      }

      // Get user roadmap status
      const { data: userRoadmap, error: urError } = await db
        .from('user_roadmaps')
        .select('status, progress_percentage, started_at, completed_at')
        .eq('user_id', userId)
        .eq('roadmap_id', roadmapId)
        .single();

      if (urError) {
        // User hasn't started this roadmap yet
        return {
          roadmap_id: roadmap.roadmap_id,
          roadmap_title: roadmap.roadmap_title,
          status: 'not_started',
          progress_percentage: 0,
          milestones: []
        };
      }

      // Get milestones for this roadmap
      const { data: milestones, error: milestonesError } = await db
        .from('Milestones')
        .select('milestone_id, milestone_title, milestone_order')
        .eq('roadmap_id', roadmapId)
        .order('milestone_order', { ascending: true });

      if (milestonesError) throw milestonesError;

      // Get completed milestones from progress
      const { data: completedMilestones, error: progressError } = await db
        .from('user_progress')
        .select('milestone_id, completed_at, time_spent_minutes')
        .eq('user_id', userId)
        .eq('roadmap_id', roadmapId)
        .eq('progress_type', 'milestone_completed')
        .not('completed_at', 'is', null);

      if (progressError) throw progressError;

      const completedIds = new Set(completedMilestones?.map(m => m.milestone_id) || []);

      // Combine milestone data with completion status
      const milestonesWithProgress = milestones?.map(m => {
        const completed = completedMilestones?.find(cm => cm.milestone_id === m.milestone_id);
        return {
          milestone_id: m.milestone_id,
          milestone_title: m.milestone_title,
          milestone_order: m.milestone_order,
          is_completed: completedIds.has(m.milestone_id),
          completed_at: completed?.completed_at || null,
          time_spent_minutes: completed?.time_spent_minutes || 0
        };
      }) || [];

      const completionPercentage = milestones?.length > 0 
        ? Math.round((completedIds.size / milestones.length) * 100)
        : 0;

      logger.info(`Retrieved roadmap progress for user ${userId}, roadmap ${roadmapId}`);

      return {
        roadmap_id: roadmap.roadmap_id,
        roadmap_title: roadmap.roadmap_title,
        difficulty_level: roadmap.difficulty_level,
        estimated_duration_weeks: roadmap.estimated_duration_weeks,
        status: userRoadmap.status,
        progress_percentage: completionPercentage,
        started_at: userRoadmap.started_at,
        completed_at: userRoadmap.completed_at,
        total_milestones: milestones?.length || 0,
        completed_milestones: completedIds.size,
        milestones: milestonesWithProgress
      };
    } catch (error) {
      logger.error(`Error getting roadmap progress:`, error);
      throw error;
    }
  }

  /**
   * Track progress activity (milestone completion, resource completion, etc.)
   */
  async trackProgress(userId, progressData) {
    try {
      const {
        progress_type,
        roadmap_id,
        milestone_id,
        resource_id,
        completion_percentage,
        time_spent_minutes,
        notes
      } = progressData;

      // Validate progress type
      const validTypes = ['roadmap_started', 'milestone_completed', 'resource_completed', 'skill_leveled_up', 'learning_session'];
      if (!validTypes.includes(progress_type)) {
        throw new Error(`Invalid progress_type. Must be one of: ${validTypes.join(', ')}`);
      }

      // Insert progress record
      const { data: progress, error: insertError } = await db
        .from('user_progress')
        .insert({
          user_id: userId,
          progress_type,
          roadmap_id: roadmap_id || null,
          milestone_id: milestone_id || null,
          resource_id: resource_id || null,
          completion_percentage: completion_percentage || 0,
          time_spent_minutes: time_spent_minutes || 0,
          notes: notes || null,
          completed_at: progress_type.includes('completed') ? new Date().toISOString() : null
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // If milestone completed, update user_roadmap progress
      if (progress_type === 'milestone_completed' && roadmap_id) {
        await this.updateRoadmapProgress(userId, roadmap_id);
      }

      logger.info(`Tracked ${progress_type} for user ${userId}`);

      return progress;
    } catch (error) {
      logger.error('Error tracking progress:', error);
      throw error;
    }
  }

  /**
   * Helper: Update roadmap progress percentage
   */
  async updateRoadmapProgress(userId, roadmapId) {
    try {
      // Get total milestones
      const { data: totalMilestones, error: totalError } = await db
        .from('Milestones')
        .select('milestone_id', { count: 'exact' })
        .eq('roadmap_id', roadmapId);

      if (totalError) throw totalError;

      // Get completed milestones
      const { data: completedMilestones, error: completedError } = await db
        .from('user_progress')
        .select('milestone_id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('roadmap_id', roadmapId)
        .eq('progress_type', 'milestone_completed')
        .not('completed_at', 'is', null);

      if (completedError) throw completedError;

      const total = totalMilestones?.length || 0;
      const completed = completedMilestones?.length || 0;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      // Update user_roadmap
      const { error: updateError } = await db
        .from('user_roadmaps')
        .update({
          progress_percentage: percentage,
          status: percentage === 100 ? 'completed' : 'in-progress',
          completed_at: percentage === 100 ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('roadmap_id', roadmapId);

      if (updateError) throw updateError;

      logger.info(`Updated roadmap ${roadmapId} progress to ${percentage}%`);
    } catch (error) {
      logger.error('Error updating roadmap progress:', error);
      // Don't throw - this is a helper function
    }
  }

  /**
   * Get learning statistics over time (for charts)
   */
  async getLearningStats(userId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: progressRecords, error } = await db
        .from('user_progress')
        .select('progress_type, time_spent_minutes, created_at')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by date
      const dailyStats = {};
      progressRecords?.forEach(p => {
        const date = new Date(p.created_at).toISOString().split('T')[0];
        if (!dailyStats[date]) {
          dailyStats[date] = {
            date,
            activities: 0,
            time_spent_minutes: 0
          };
        }
        dailyStats[date].activities += 1;
        dailyStats[date].time_spent_minutes += p.time_spent_minutes || 0;
      });

      const statsArray = Object.values(dailyStats);

      logger.info(`Retrieved ${days}-day learning stats for user ${userId}`);

      return {
        period_days: days,
        total_activities: progressRecords?.length || 0,
        total_time_hours: Math.round(
          (progressRecords?.reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0) || 0) / 60
        ),
        daily_stats: statsArray
      };
    } catch (error) {
      logger.error('Error getting learning stats:', error);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();
