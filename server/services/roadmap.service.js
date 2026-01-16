const Roadmap = require('../models/Roadmap.model');
const RoadmapTemplate = require('../models/RoadmapTemplate.model');
const { NotFoundError } = require('../utils/errors');
const logger = require('../utils/logger');

class RoadmapService {
    static async createRoadmapFromTemplate(userId, templateId, title) {
        const template = await RoadmapTemplate.findById(templateId);
        if (!template) {
            throw new NotFoundError('Roadmap template not found');
        }

        const newRoadmap = await Roadmap.create({
            user_id: userId,
            template_id: templateId,
            title: title || template.title,
            description: template.description,
            category: template.category,
            tags: template.tags,
            roadmap_data: template.roadmap_data
        });

        logger.info(`Roadmap created from template ${templateId} for user ${userId}`);
        return newRoadmap;
    }


    static async findByUserId(userId) {
        const roadmaps = await Roadmap.find({ user_id: userId });
        logger.info(`Found ${roadmaps.length} roadmaps for user ${userId}`);
        return roadmaps;
    }

    static async findById(roadmapId) {
        const roadmap = await Roadmap.findById(roadmapId);
        if (!roadmap) {
            throw new NotFoundError('Roadmap not found');
        }
        logger.info(`Found roadmap with id ${roadmapId}`);
        return roadmap;
    }

    static async getRoadmapWithProgress(roadmapId, userId) {
        // Fetch the roadmap
        const roadmap = await Roadmap.findById(roadmapId);
        if (!roadmap) {
            throw new NotFoundError('Roadmap not found');
        }
        if (roadmap.user_id !== userId) {
            throw new Error('You are not authorized to view this roadmap');
        }

        // Fetch user roadmap modules (steps) and their status
        const UserRoadmap = require('../models/UserRoadmap.model');
        const modules = await UserRoadmap.getModules(roadmapId);
        const totalSteps = modules.length;
        const completedSteps = modules.filter(m => m.status === 'completed').length;
        const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

        const progress = {
            total_steps: totalSteps,
            completed_steps: completedSteps,
            percentage
        };

        return { ...roadmap, progress };
    }
}

module.exports = RoadmapService;
