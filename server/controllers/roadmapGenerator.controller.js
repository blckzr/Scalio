const roadmapGeneratorService = require('../services/roadmapGenerator.service');
const logger = require('../utils/logger');
const { body, param, query, validationResult } = require('express-validator');

class RoadmapGeneratorController {
  async generateRoadmap(req, res, next) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { learning_goal, current_skills, hours_per_week, experience_level } = req.body;
      const user_id = req.user.user_id; 

      logger.info(`Roadmap generation request`, {
        user_id,
        learning_goal,
        current_skills: current_skills?.length || 0
      });

      const roadmap = await roadmapGeneratorService.generateRoadmap({
        user_id,
        learning_goal,
        current_skills: current_skills || [],
        hours_per_week: hours_per_week || 10,
        experience_level: experience_level || 'beginner'
      });

      res.status(201).json({
        success: true,
        message: 'Personalized roadmap generated successfully',
        data: roadmap
      });

    } catch (error) {
      logger.error('Roadmap generation failed', { error: error.message });
      next(error);
    }
  }

  async getTemplates(req, res, next) {
    try {
      const templates = await roadmapGeneratorService.getAvailableTemplates();

      res.status(200).json({
        success: true,
        message: 'Templates fetched successfully',
        data: templates,
        count: templates.length
      });

    } catch (error) {
      logger.error('Failed to fetch templates', { error: error.message });
      next(error);
    }
  }
}

// Validation middleware
const generateRoadmapValidation = [
  body('learning_goal')
    .notEmpty().withMessage('Learning goal is required')
    .isString().withMessage('Learning goal must be a string')
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('Learning goal must be 3-200 characters'),
  
  body('current_skills')
    .optional()
    .isArray().withMessage('Current skills must be an array')
    .custom((value) => {
      if (value && value.some(s => typeof s !== 'string')) {
        throw new Error('All skills must be strings');
      }
      return true;
    }),
  
  body('hours_per_week')
    .optional()
    .isInt({ min: 1, max: 168 }).withMessage('Hours per week must be 1-168')
    .toInt(),
  
  body('experience_level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Experience level must be: beginner, intermediate, or advanced')
];

module.exports = {
  controller: new RoadmapGeneratorController(),
  validation: {
    generateRoadmap: generateRoadmapValidation
  }
};