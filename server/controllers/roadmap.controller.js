const RoadmapService = require('../services/roadmap.service');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

class RoadmapController {
    static async getUserRoadmaps(req, res) {
        try {
            const userId = req.user?.user_id;
            const roadmaps = await RoadmapService.findByUserId(userId);
            return successResponse(res, roadmaps, 'User roadmaps retrieved successfully');
        } catch (error) {
            logger.error('Error in getUserRoadmaps:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    static async getRoadmapById(req, res) {
        try {
            const { roadmapId } = req.params;
            const roadmap = await RoadmapService.findById(roadmapId);
            if (!roadmap) {
                return errorResponse(res, 'Roadmap not found', 404);
            }
            return successResponse(res, roadmap, 'Roadmap retrieved successfully');
        } catch (error) {
            logger.error('Error in getRoadmapById:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    static async createRoadmap(req, res) {
        try {
            const { template_id, title } = req.body;
            const userId = req.user?.user_id;
            const newRoadmap = await RoadmapService.createRoadmapFromTemplate(userId, template_id, title);
            return successResponse(res, newRoadmap, 'Roadmap created successfully', 201);
        } catch (error) {
            logger.error('Error in createRoadmap:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    static async updateRoadmap(req, res) {
        try {
            const { roadmapId } = req.params;
            const updates = req.body;
            const updatedRoadmap = await RoadmapService.update(roadmapId, updates);
            return successResponse(res, updatedRoadmap, 'Roadmap updated successfully');
        } catch (error) {
            logger.error('Error in updateRoadmap:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    static async getRoadmapWithProgress(req, res) {
        try {
            const { roadmapId } = req.params;
            const userId = req.user?.user_id;
            const roadmapWithProgress = await RoadmapService.getRoadmapWithProgress(roadmapId, userId);
            return successResponse(res, roadmapWithProgress, 'Roadmap with progress retrieved successfully');
        } catch (error) {
            logger.error('Error in getRoadmapWithProgress:', error);
            return errorResponse(res, error.message, 500);
        }
    }
}

module.exports = RoadmapController;
