const careerService = require('../services/career.service');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

class CareerController {
  static async getCareerInsights(req, res) {
    try {
      const userId = req.user?.user_id;

      if (!userId) {
        return errorResponse(res, 'User authentication required', 401);
      }

      const insights = await careerService.getCareerInsights(userId);

      return successResponse(
        res,
        insights,
        'Career insights generated successfully'
      );
    } catch (error) {
      logger.error('Error in getCareerInsights:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  static async predictSalary(req, res) {
    try {
      const userId = req.user?.user_id;

      if (!userId) {
        return errorResponse(res, 'User authentication required', 401);
      }

      const prediction = await careerService.predictSalary(userId);

      return successResponse(
        res,
        prediction,
        'Salary prediction generated successfully'
      );
    } catch (error) {
      logger.error('Error in predictSalary:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  static async analyzeSkillGap(req, res) {
    try {
      const userId = req.user?.user_id;
      const targetRole = req.query.role || null;

      if (!userId) {
        return errorResponse(res, 'User authentication required', 401);
      }

      const gapAnalysis = await careerService.analyzeSkillGap(userId, targetRole);

      return successResponse(
        res,
        gapAnalysis,
        'Skill gap analysis completed successfully'
      );
    } catch (error) {
      logger.error('Error in analyzeSkillGap:', error);
      return errorResponse(res, error.message, 500);
    }
  }
}

module.exports = CareerController;
