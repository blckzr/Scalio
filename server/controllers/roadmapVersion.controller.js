const roadmapVersionService = require('../services/roadmapVersion.service');
const { successResponse, errorResponse } = require('../utils/response');
const logger = require('../utils/logger');

class RoadmapVersionController {

  async checkUpdates(req, res) {
    try {
      const { roadmapId } = req.params;
      const user_id = req.user.user_id;

      const result = await roadmapVersionService.checkForUpdates(user_id, roadmapId);

      return successResponse(res, result, 'Update check completed');
    } catch (error) {
      logger.error('Error checking updates:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async compareVersions(req, res) {
    try {
      const { roadmapId, newVersion } = req.params;
      const user_id = req.user.user_id;

      const comparison = await roadmapVersionService.compareVersions(user_id, roadmapId, newVersion);

      return successResponse(res, comparison, 'Version comparison completed');
    } catch (error) {
      logger.error('Error comparing versions:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async getRecommendation(req, res) {
    try {
      const { roadmapId, newVersion } = req.params;
      const user_id = req.user.user_id;

      const recommendation = await roadmapVersionService.getUpdateRecommendation(user_id, roadmapId, newVersion);

      return successResponse(res, recommendation, 'AI recommendation generated');
    } catch (error) {
      logger.error('Error getting recommendation:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async acceptUpdate(req, res) {
    try {
      const { roadmapId } = req.params;
      const { new_version } = req.body;
      const user_id = req.user.user_id;

      if (!new_version) {
        return errorResponse(res, 'new_version is required', 400);
      }

      const result = await roadmapVersionService.acceptUpdate(user_id, roadmapId, new_version);

      return successResponse(res, result, 'Update accepted and applied', 200);
    } catch (error) {
      logger.error('Error accepting update:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async rejectUpdate(req, res) {
    try {
      const { roadmapId } = req.params;
      const { new_version, reason } = req.body;
      const user_id = req.user.user_id;

      if (!new_version) {
        return errorResponse(res, 'new_version is required', 400);
      }

      const result = await roadmapVersionService.rejectUpdate(user_id, roadmapId, new_version, reason);

      return successResponse(res, result, 'Update rejected');
    } catch (error) {
      logger.error('Error rejecting update:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async getMigrationHistory(req, res) {
    try {
      const { roadmapId } = req.params;
      const user_id = req.user.user_id;

      const history = await roadmapVersionService.getMigrationHistory(user_id, roadmapId);

      return successResponse(res, { migrations: history, total: history.length }, 'Migration history retrieved');
    } catch (error) {
      logger.error('Error getting migration history:', error);
      return errorResponse(res, error.message, 500);
    }
  }
}

module.exports = new RoadmapVersionController();
