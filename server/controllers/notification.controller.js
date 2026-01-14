const notificationService = require("../services/notification.service");
const {
  successResponse,
  errorResponse,
} = require("../utils/responseFormatter");
const logger = require("../utils/logger");

class NotificationController {
  /**
   * GET /api/notifications?unread_only=true&limit=50&offset=0
   * Get all notifications for authenticated user
   */
  static async getNotifications(req, res) {
    try {
      const userId = req.user?.user_id;
      const { unread_only, limit, offset } = req.query;

      if (!userId) {
        return errorResponse(res, "User authentication required", 401);
      }

      const options = {
        unread_only: unread_only === "true",
        limit: parseInt(limit) || 50,
        offset: parseInt(offset) || 0,
      };

      const result = await notificationService.getUserNotifications(
        userId,
        options
      );

      return successResponse(
        res,
        result,
        "Notifications retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getNotifications:", error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * GET /api/notifications/unread-count
   * Get count of unread notifications
   */
  static async getUnreadCount(req, res) {
    try {
      const userId = req.user?.user_id;

      if (!userId) {
        return errorResponse(res, "User authentication required", 401);
      }

      const count = await notificationService.getUnreadCount(userId);

      return successResponse(
        res,
        { unread_count: count },
        "Unread count retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getUnreadCount:", error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * PATCH /api/notifications/:id/read
   * Mark a notification as read
   */
  static async markAsRead(req, res) {
    try {
      const userId = req.user?.user_id;
      const { id } = req.params;

      if (!userId) {
        return errorResponse(res, "User authentication required", 401);
      }

      if (!id) {
        return errorResponse(res, "Notification ID is required", 400);
      }

      const result = await notificationService.markAsRead(userId, id);

      return successResponse(
        res,
        result,
        "Notification marked as read successfully"
      );
    } catch (error) {
      logger.error("Error in markAsRead:", error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * PATCH /api/notifications/mark-all-read
   * Mark all notifications as read
   */
  static async markAllAsRead(req, res) {
    try {
      const userId = req.user?.user_id;

      if (!userId) {
        return errorResponse(res, "User authentication required", 401);
      }

      const result = await notificationService.markAllAsRead(userId);

      return successResponse(
        res,
        result,
        "All notifications marked as read successfully"
      );
    } catch (error) {
      logger.error("Error in markAllAsRead:", error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * DELETE /api/notifications/:id
   * Delete a notification
   */
  static async deleteNotification(req, res) {
    try {
      const userId = req.user?.user_id;
      const { id } = req.params;

      if (!userId) {
        return errorResponse(res, "User authentication required", 401);
      }

      if (!id) {
        return errorResponse(res, "Notification ID is required", 400);
      }

      const result = await notificationService.deleteNotification(userId, id);

      return successResponse(
        res,
        result,
        "Notification deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteNotification:", error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * POST /api/notifications/create
   * Create a new notification (for testing or admin use)
   */
  static async createNotification(req, res) {
    try {
      const userId = req.user?.user_id;
      const notificationData = req.body;

      if (!userId) {
        return errorResponse(res, "User authentication required", 401);
      }

      const notification = await notificationService.createNotification(
        userId,
        notificationData
      );

      return successResponse(
        res,
        notification,
        "Notification created successfully",
        201
      );
    } catch (error) {
      logger.error("Error in createNotification:", error);
      return errorResponse(res, error.message, 500);
    }
  }
}

module.exports = NotificationController;
