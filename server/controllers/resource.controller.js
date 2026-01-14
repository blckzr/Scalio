const resourceService = require('../services/resource.service');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

class ResourceController {
  /**
   * GET /api/resources/recommendations
   * Get personalized learning resource recommendations based on user's skills
   */
  static async getRecommendations(req, res) {
    try {
      const userId = req.user?.user_id;

      if (!userId) {
        return errorResponse(res, 'User authentication required', 401);
      }

      const recommendations = await resourceService.getRecommendations(userId);

      return successResponse(
        res,
        recommendations,
        'Learning recommendations generated successfully'
      );
    } catch (error) {
      logger.error('Error in getRecommendations:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  static async getResourcesBySkill(req, res) {
    try {
      const { skillName } = req.params;
      const { difficulty, type } = req.query;

      if (!skillName) {
        return errorResponse(res, 'Skill name is required', 400);
      }

      const resources = await resourceService.getResourcesBySkill(
        skillName,
        difficulty,
        type
      );

      return successResponse(
        res,
        resources,
        'Resources retrieved successfully'
      );
    } catch (error) {
      logger.error('Error in getResourcesBySkill:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  static async getLearningPath(req, res) {
    try {
      const { skillName } = req.params;

      if (!skillName) {
        return errorResponse(res, 'Skill name is required', 400);
      }

      const learningPath = await resourceService.getLearningPath(skillName);

      return successResponse(
        res,
        learningPath,
        'Learning path retrieved successfully'
      );
    } catch (error) {
      logger.error('Error in getLearningPath:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  static async addResource(req, res) {
    try {
      const resourceData = req.body;

      // Validate required fields
      const requiredFields = ['skill_name', 'title', 'resource_type', 'difficulty_level', 'url'];
      const missingFields = requiredFields.filter(field => !resourceData[field]);

      if (missingFields.length > 0) {
        return errorResponse(
          res,
          `Missing required fields: ${missingFields.join(', ')}`,
          400
        );
      }

      const resource = await resourceService.addResource(resourceData);

      return successResponse(
        res,
        resource,
        'Learning resource added successfully',
        201
      );
    } catch (error) {
      logger.error('Error in addResource:', error);
      return errorResponse(res, error.message, 500);
    }
  }
}

module.exports = ResourceController;
