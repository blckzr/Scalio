const syncService = require('../services/sync.service');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

/**
 * Trigger manual sync from all Level 1 sources
 */
const triggerSync = async (req, res) => {
  try {
    const { source } = req.query;

    logger.info(`Manual sync triggered by admin${source ? ` for source: ${source}` : ''}`);

    let result;
    
    if (source === 'roadmap.sh') {
      result = await syncService.syncRoadmapSh();
    } else if (!source || source === 'all') {
      result = await syncService.syncAllSources();
    } else {
      return errorResponse(res, `Invalid source: ${source}`, 400);
    }

    return successResponse(
      res,
      result,
      `Sync completed for ${source || 'all sources'}`,
      200
    );
  } catch (error) {
    logger.error('Sync trigger failed:', error);
    return errorResponse(res, error.message || 'Failed to trigger sync', 500);
  }
};

/**
 * Get sync status and history
 */
const getSyncStatus = async (req, res) => {
  try {
    const status = await syncService.getSyncStatus();

    return successResponse(
      res,
      status,
      'Sync status retrieved successfully',
      200
    );
  } catch (error) {
    logger.error('Failed to get sync status:', error);
    return errorResponse(res, 'Failed to retrieve sync status', 500);
  }
};

module.exports = {
  triggerSync,
  getSyncStatus,
};
