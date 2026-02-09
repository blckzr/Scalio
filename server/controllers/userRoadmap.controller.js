const userRoadmapService = require('../services/userRoadmap.service');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const logger = require('../utils/logger');


exports.createUserRoadmap = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { template_id, version = '1.0' } = req.body;

    if (!template_id) {
      return errorResponse(res, 'template_id is required', 400);
    }

    const userRoadmap = await userRoadmapService.createUserRoadmap(userId, template_id, version);

    logger.info(`User ${userId} created roadmap ${userRoadmap.user_roadmap_id}`);
    return successResponse(res, userRoadmap, 'User roadmap created successfully', 201);
  } catch (error) {
    logger.error('Error creating user roadmap:', error.message);
    return errorResponse(res, error.message, 400);
  }
};

exports.getUserRoadmaps = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const activeOnly = req.query.active_only === 'true';

    const roadmaps = await userRoadmapService.getUserRoadmaps(userId, activeOnly);

    return successResponse(res, roadmaps, 'User roadmaps retrieved successfully');
  } catch (error) {
    logger.error('Error fetching user roadmaps:', error.message);
    return errorResponse(res, error.message, 500);
  }
};


exports.getUserRoadmapById = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const roadmapId = parseInt(req.params.roadmap_id);

    if (isNaN(roadmapId)) {
      return errorResponse(res, 'Invalid roadmap ID', 400);
    }

    const roadmap = await userRoadmapService.getUserRoadmap(roadmapId, userId);

    return successResponse(res, roadmap, 'User roadmap retrieved successfully');
  } catch (error) {
    logger.error('Error fetching user roadmap:', error.message);
    return errorResponse(res, error.message, error.message.includes('not found') ? 404 : 500);
  }
};

exports.updateModuleStatus = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const moduleId = parseInt(req.params.module_id);
    const { status, notes, time_spent_minutes } = req.body;

    if (isNaN(moduleId)) {
      return errorResponse(res, 'Invalid module ID', 400);
    }

    if (!status) {
      return errorResponse(res, 'status is required', 400);
    }

    const validStatuses = ['not_started', 'in_progress', 'completed', 'skipped'];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const updatedModule = await userRoadmapService.updateModuleStatus(
      moduleId,
      userId,
      status,
      { notes, time_spent_minutes }
    );

    logger.info(`User ${userId} updated module ${moduleId} to ${status}`);
    return successResponse(res, updatedModule, 'Module status updated successfully');
  } catch (error) {
    logger.error('Error updating module status:', error.message);
    return errorResponse(res, error.message, error.message.includes('Unauthorized') ? 403 : 400);
  }
};

exports.checkVersionUpdates = async (req, res) => {
  try {
    const roadmapId = parseInt(req.params.roadmap_id);

    if (isNaN(roadmapId)) {
      return errorResponse(res, 'Invalid roadmap ID', 400);
    }

    const update = await userRoadmapService.checkForVersionUpdates(roadmapId);

    if (!update) {
      return successResponse(res, null, 'No updates available');
    }

    return successResponse(res, update, 'Version update available');
  } catch (error) {
    logger.error('Error checking version updates:', error.message);
    return errorResponse(res, error.message, 500);
  }
};

exports.respondToVersionUpdate = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const updateId = parseInt(req.params.update_id);
    const { response } = req.body;

    if (isNaN(updateId)) {
      return errorResponse(res, 'Invalid update ID', 400);
    }

    if (!response) {
      return errorResponse(res, 'response is required', 400);
    }

    const validResponses = ['accepted', 'rejected', 'dismissed'];
    if (!validResponses.includes(response)) {
      return errorResponse(res, `Invalid response. Must be one of: ${validResponses.join(', ')}`, 400);
    }

    const updatedNotification = await userRoadmapService.respondToVersionUpdate(
      updateId,
      userId,
      response
    );

    logger.info(`User ${userId} ${response} version update ${updateId}`);
    return successResponse(res, updatedNotification, `Version update ${response} successfully`);
  } catch (error) {
    logger.error('Error responding to version update:', error.message);
    return errorResponse(res, error.message, error.message.includes('Unauthorized') ? 403 : 400);
  }
};

exports.deleteUserRoadmap = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const roadmapId = parseInt(req.params.roadmap_id);

    if (isNaN(roadmapId)) {
      return errorResponse(res, 'Invalid roadmap ID', 400);
    }

    await userRoadmapService.deleteUserRoadmap(roadmapId, userId);

    logger.info(`User ${userId} deleted roadmap ${roadmapId}`);
    return successResponse(res, null, 'User roadmap deleted successfully');
  } catch (error) {
    logger.error('Error deleting user roadmap:', error.message);
    return errorResponse(res, error.message, error.message.includes('Unauthorized') ? 403 : 400);
  }
};

exports.getRoadmapStats = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const roadmapId = parseInt(req.params.roadmap_id);

    if (isNaN(roadmapId)) {
      return errorResponse(res, 'Invalid roadmap ID', 400);
    }

    const roadmap = await userRoadmapService.getUserRoadmap(roadmapId, userId);

    return successResponse(res, {
      user_roadmap_id: roadmap.user_roadmap_id,
      template_title: roadmap.template_title,
      status: roadmap.status,
      progress_percentage: roadmap.progress_percentage,
      statistics: roadmap.statistics,
      started_at: roadmap.started_at,
      completed_at: roadmap.completed_at,
      estimated_completion_date: roadmap.estimated_completion_date,
      last_activity_at: roadmap.last_activity_at
    }, 'Roadmap statistics retrieved successfully');
  } catch (error) {
    logger.error('Error fetching roadmap stats:', error.message);
    return errorResponse(res, error.message, error.message.includes('not found') ? 404 : 500);
  }
};