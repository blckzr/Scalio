const analyticsService = require('../services/analytics.service');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

class AnalyticsController {
 
  static async getUserAnalytics(req, res) {
    try {
      const userId = req.user?.user_id;

      if (!userId) {
        return errorResponse(res, 'User authentication required', 401);
      }

      const analytics = await analyticsService.getUserAnalytics(userId);

      return successResponse(
        res,
        analytics,
        'User analytics retrieved successfully'
      );
    } catch (error) {
      logger.error('Error in getUserAnalytics:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  static async getRoadmapProgress(req, res) {
    try {
      const userId = req.user?.user_id;
      const { roadmapId } = req.params;

      if (!userId) {
        return errorResponse(res, 'User authentication required', 401);
      }

      if (!roadmapId) {
        return errorResponse(res, 'Roadmap ID is required', 400);
      }

      const progress = await analyticsService.getRoadmapProgress(userId, roadmapId);

      return successResponse(
        res,
        progress,
        'Roadmap progress retrieved successfully'
      );
    } catch (error) {
      logger.error('Error in getRoadmapProgress:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  static async trackProgress(req, res) {
    try {
      const userId = req.user?.user_id;
      const progressData = req.body;

      if (!userId) {
        return errorResponse(res, 'User authentication required', 401);
      }

      if (!progressData.progress_type) {
        return errorResponse(res, 'progress_type is required', 400);
      }

      const progress = await analyticsService.trackProgress(userId, progressData);

      return successResponse(
        res,
        progress,
        'Progress tracked successfully',
        201
      );
    } catch (error) {
      logger.error('Error in trackProgress:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  static async getLearningStats(req, res) {
    try {
      const userId = req.user?.user_id;
      const days = parseInt(req.query.days) || 30;

      if (!userId) {
        return errorResponse(res, 'User authentication required', 401);
      }

      if (days < 1 || days > 365) {
        return errorResponse(res, 'days parameter must be between 1 and 365', 400);
      }

      const stats = await analyticsService.getLearningStats(userId, days);

      return successResponse(
        res,
        stats,
        'Learning statistics retrieved successfully'
      );
    } catch (error) {
      logger.error('Error in getLearningStats:', error);
      return errorResponse(res, error.message, 500);
    }
  }
}

module.exports = AnalyticsController;
