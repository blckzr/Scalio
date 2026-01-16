const CoachService = require('../services/coach.service');
const logger = require('../utils/logger');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

class CoachController {
  async recordCheckIn(req, res) {
    try {
      const userId = req.user?.user_id;
      if (!userId) {
        return errorResponse(res, 'User not authenticated', 401);
      }

      const { activity_type = 'study_session', duration_minutes = 0 } = req.body;

      const validTypes = [
        'milestone_completed',
        'study_session',
        'roadmap_created',
        'skill_assessed',
        'lesson_completed'
      ];

      if (!validTypes.includes(activity_type)) {
        return errorResponse(
          res,
          `Invalid activity type. Must be one of: ${validTypes.join(', ')}`,
          400
        );
      }

      const checkInData = await CoachService.recordCheckIn(
        userId,
        activity_type,
        duration_minutes
      );

      return successResponse(
        res,
        checkInData,
        'Check-in recorded successfully',
        201
      );
    } catch (error) {
      logger.error('Error in recordCheckIn controller:', error);
      return errorResponse(res, 'Failed to record check-in', 500);
    }
  }

  async getUserStats(req, res) {
    try {
      const userId = req.user?.user_id;
      if (!userId) {
        return errorResponse(res, 'User not authenticated', 401);
      }

      const stats = await CoachService.getUserStats(userId);

      return successResponse(res, stats, 'Stats retrieved successfully', 200);
    } catch (error) {
      logger.error('Error in getUserStats controller:', error);
      return errorResponse(res, 'Failed to retrieve stats', 500);
    }
  }

  async getMotivation(req, res) {
    try {
      const userId = req.user?.user_id;
      if (!userId) {
        return errorResponse(res, 'User not authenticated', 401);
      }

      const stats = await CoachService.getUserStats(userId);

      const message = CoachService.getMotivationMessage(
        stats.current_streak,
        'general'
      );

      return successResponse(
        res,
        {
          message,
          current_streak: stats.current_streak,
          type: stats.current_streak >= 7 ? 'streak' : 'progress'
        },
        'Motivation retrieved successfully',
        200
      );
    } catch (error) {
      logger.error('Error in getMotivation controller:', error);
      return errorResponse(res, 'Failed to retrieve motivation', 500);
    }
  }

  async getRecentSessions(req, res) {
    try {
      const userId = req.user?.user_id;
      if (!userId) {
        return errorResponse(res, 'User not authenticated', 401);
      }

      const limit = parseInt(req.query.limit) || 10;
      const sessions = await CoachService.getRecentSessions(userId, limit);

      return successResponse(
        res,
        sessions,
        'Recent sessions retrieved successfully',
        200
      );
    } catch (error) {
      logger.error('Error in getRecentSessions controller:', error);
      return errorResponse(res, 'Failed to retrieve sessions', 500);
    }
  }

  async getWeeklyCalendar(req, res) {
    try {
      const userId = req.user?.user_id;
      if (!userId) {
        return errorResponse(res, 'User not authenticated', 401);
      }

      const calendar = await CoachService.getWeeklyCalendar(userId);

      return successResponse(
        res,
        calendar,
        'Weekly calendar retrieved successfully',
        200
      );
    } catch (error) {
      logger.error('Error in getWeeklyCalendar controller:', error);
      return errorResponse(res, 'Failed to retrieve calendar', 500);
    }
  }

  async getStudyTechnique(req, res) {
    try {
      const activityType = req.query.activity_type || 'general';
      const availableMinutes = parseInt(req.query.minutes) || 60;

      const technique = CoachService.getStudyTechnique(activityType, availableMinutes);

      return successResponse(
        res,
        technique,
        'Study technique recommended successfully',
        200
      );
    } catch (error) {
      logger.error('Error in getStudyTechnique controller:', error);
      return errorResponse(res, 'Failed to get study technique', 500);
    }
  }

  async startPomodoro(req, res) {
    try {
      const userId = req.user?.user_id;
      if (!userId) {
        return errorResponse(res, 'User not authenticated', 401);
      }

      const { task_description = 'Study Session' } = req.body;

      const pomodoroSession = await CoachService.startPomodoroSession(
        userId,
        task_description
      );

      return successResponse(
        res,
        pomodoroSession,
        'Pomodoro session started',
        201
      );
    } catch (error) {
      logger.error('Error in startPomodoro controller:', error);
      return errorResponse(res, 'Failed to start Pomodoro', 500);
    }
  }

  async getStudyTips(req, res) {
    try {
      const userId = req.user?.user_id;
      if (!userId) {
        return errorResponse(res, 'User not authenticated', 401);
      }

      const stats = await CoachService.getUserStats(userId);
      const tips = CoachService.getStudyTips(stats);

      return successResponse(
        res,
        tips,
        'Study tips retrieved successfully',
        200
      );
    } catch (error) {
      logger.error('Error in getStudyTips controller:', error);
      return errorResponse(res, 'Failed to retrieve study tips', 500);
    }
  }
}

module.exports = new CoachController();
