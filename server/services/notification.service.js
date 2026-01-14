const db = require('../config/database');
const { supabaseAdmin } = require('../config/database');
const logger = require('../utils/logger');

class NotificationService {
  async createNotification(userId, notificationData) {
    try {
      const {
        type,
        title,
        message,
        related_template_id = null
      } = notificationData;

      // Validate required fields
      if (!type || !title) {
        throw new Error('type and title are required');
      }

      const { data: notification, error } = await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message: message || '',
          related_template_id,
          is_read: false
        })
        .select()
        .single();

      if (error) throw error;

      logger.info(`Created ${type} notification for user ${userId}`);

      return notification;
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  async getUserNotifications(userId, options = {}) {
    try {
      const {
        unread_only = false,
        limit = 50,
        offset = 0
      } = options;

      let query = supabaseAdmin
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Filter by read status if requested
      if (unread_only) {
        query = query.eq('is_read', false);
      }

      const { data: notifications, error, count } = await query
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const unreadCount = unread_only ? count : await this.getUnreadCount(userId);

      logger.info(`Retrieved ${notifications?.length || 0} notifications for user ${userId}`);

      return {
        notifications: notifications || [],
        total: count || 0,
        unread_count: unreadCount,
        has_more: count > offset + limit
      };
    } catch (error) {
      logger.error('Error getting notifications:', error);
      throw error;
    }
  }

  async markAsRead(userId, notificationIds) {
    try {
      const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];

      const { data, error } = await supabaseAdmin
        .from('notifications')
        .update({
          is_read: true
        })
        .eq('user_id', userId)
        .in('notification_id', ids)
        .select();

      if (error) throw error;

      logger.info(`Marked ${data?.length || 0} notifications as read for user ${userId}`);

      return data;
    } catch (error) {
      logger.error('Error marking notifications as read:', error);
      throw error;
    }
  }

  async markAllAsRead(userId) {
    try {
      const { data, error } = await supabaseAdmin
        .from('notifications')
        .update({
          is_read: true
        })
        .eq('user_id', userId)
        .eq('is_read', false)
        .select();

      if (error) throw error;

      logger.info(`Marked all notifications as read for user ${userId}`);

      return { updated_count: data?.length || 0 };
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async deleteNotification(userId, notificationId) {
    try {
      const { error } = await supabaseAdmin
        .from('notifications')
        .delete()
        .eq('notification_id', notificationId)
        .eq('user_id', userId);

      if (error) throw error;

      logger.info(`Deleted notification ${notificationId} for user ${userId}`);

      return { success: true };
    } catch (error) {
      logger.error('Error deleting notification:', error);
      throw error;
    }
  }

  async getUnreadCount(userId) {
    try {
      const { count, error } = await supabaseAdmin
        .from('notifications')
        .select('notification_id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;

      return count || 0;
    } catch (error) {
      logger.error('Error getting unread count:', error);
      throw error;
    }
  }

  async createActivityNotification(userId, activityType, activityData) {
    try {
      let notificationData = {};

      switch (activityType) {
        case 'milestone_completed':
          notificationData = {
            type: 'achievement',
            title: 'Milestone Completed! ',
            message: `Congratulations! You've completed: ${activityData.milestone_title || 'a milestone'}`,
            related_template_id: activityData.template_id || null
          };
          break;

        case 'streak_achievement':
          notificationData = {
            type: 'achievement',
            title: `${activityData.days || 'Multi'}-Day Streak!`,
            message: `Amazing! You've maintained your learning streak. Keep it up!`
          };
          break;

        case 'skill_level_up':
          notificationData = {
            type: 'achievement',
            title: 'Skill Level Up!',
            message: `Your ${activityData.skill_name || 'skill'} has leveled up!`
          };
          break;

        case 'new_recommendation':
          notificationData = {
            type: 'system',
            title: 'New Learning Resources',
            message: `We've found new resources perfect for your skill level!`
          };
          break;

        case 'roadmap_progress':
          notificationData = {
            type: 'system',
            title: 'Roadmap Progress Update',
            message: `You're making great progress on your roadmap!`,
            related_template_id: activityData.template_id || null
          };
          break;

        case 'version_update':
          notificationData = {
            type: 'version_update',
            title: activityData.title || 'Version Update',
            message: activityData.message || 'A new version is available'
          };
          break;

        default:
          throw new Error(`Unknown activity type: ${activityType}`);
      }

      return await this.createNotification(userId, notificationData);
    } catch (error) {
      logger.error('Error creating activity notification:', error);
      throw error;
    }
  }

  async cleanupOldNotifications() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await db
        .from('notifications')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString())
        .eq('is_read', true)
        .select();

      if (error) throw error;

      logger.info(`Cleaned up ${data?.length || 0} old notifications`);

      return { deleted_count: data?.length || 0 };
    } catch (error) {
      logger.error('Error cleaning up notifications:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
