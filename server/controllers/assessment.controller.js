const assessmentService = require('../services/assessment.service');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

class AssessmentController {
  static async submitAssessment(req, res) {
    try {
      const { skill_name, proficiency_level } = req.body;
      const userId = req.user?.user_id;

      if (!skill_name || !proficiency_level) {
        return errorResponse(res, 'skill_name and proficiency_level are required', 400);
      }

      if (!userId) {
        return errorResponse(res, 'User authentication required', 401);
      }

      const result = await assessmentService.submitSkillAssessment(
        userId,
        skill_name,
        proficiency_level
      );

      return successResponse(
        res,
        result,
        'Skill assessment submitted successfully',
        201
      );
    } catch (error) {
      logger.error('Error in submitAssessment:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  static async getUserAssessments(req, res) {
    try {
      const userId = req.user?.user_id;

      if (!userId) {
        return errorResponse(res, 'User authentication required', 401);
      }

      const skills = await assessmentService.getUserSkills(userId);

      return successResponse(
        res,
        skills,
        'User skill assessments retrieved successfully'
      );
    } catch (error) {
      logger.error('Error in getUserAssessments:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  static async quickAssessment(req, res) {
    try {
      const { skills } = req.body;
      const userId = req.user?.user_id;

      if (!skills || !Array.isArray(skills) || skills.length === 0) {
        return errorResponse(res, 'skills array is required and must not be empty', 400);
      }

      if (!userId) {
        return errorResponse(res, 'User authentication required', 401);
      }

      for (const skill of skills) {
        if (!skill.skill || !skill.level) {
          return errorResponse(res, 'Each skill must have "skill" and "level" properties', 400);
        }
      }

      const result = await assessmentService.quickAssessment(userId, skills);

      return successResponse(
        res,
        result,
        'Quick assessment completed successfully',
        201
      );
    } catch (error) {
      logger.error('Error in quickAssessment:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  static async updateAssessment(req, res) {
    try {
      const { skillId } = req.params;
      const { proficiency_level } = req.body;
      const userId = req.user?.user_id;

      if (!proficiency_level) {
        return errorResponse(res, 'proficiency_level is required', 400);
      }

      if (!userId) {
        return errorResponse(res, 'User authentication required', 401);
      }

      const result = await assessmentService.updateSkillAssessment(
        userId,
        skillId,
        proficiency_level
      );

      return successResponse(
        res,
        result,
        'Skill assessment updated successfully'
      );
    } catch (error) {
      logger.error('Error in updateAssessment:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  static async deleteAssessment(req, res) {
    try {
      const { skillId } = req.params;
      const userId = req.user?.user_id;

      if (!userId) {
        return errorResponse(res, 'User authentication required', 401);
      }

      await assessmentService.deleteSkillAssessment(userId, skillId);

      return successResponse(
        res,
        null,
        'Skill assessment deleted successfully'
      );
    } catch (error) {
      logger.error('Error in deleteAssessment:', error);
      return errorResponse(res, error.message, 500);
    }
  }
}

module.exports = AssessmentController;