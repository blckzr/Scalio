const marketService = require('../services/market.service');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

const syncSkillDemand = async (req, res) => {
  try {
    logger.info('Manual skill demand sync triggered by admin');

    const results = await marketService.syncAllSkillsDemand();

    return successResponse(
      res,
      results,
      `Skill demand sync completed: ${results.success.length} success, ${results.failed.length} failed`,
      200
    );
  } catch (error) {
    logger.error('Skill demand sync failed:', error);
    return errorResponse(res, error.message || 'Failed to sync skill demand', 500);
  }
};

const getSkillDemand = async (req, res) => {
  try {
    const { skill } = req.params;

    const demandData = await marketService.getSkillDemand(skill);

    if (!demandData) {
      return errorResponse(res, `Skill "${skill}" not found`, 404);
    }

    return successResponse(
      res,
      demandData,
      `Demand data for ${skill} retrieved successfully`,
      200
    );
  } catch (error) {
    logger.error('Failed to get skill demand:', error);
    return errorResponse(res, 'Failed to retrieve skill demand data', 500);
  }
};

const getTopSkills = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const topSkills = await marketService.getTopSkills(limit);

    return successResponse(
      res,
      { skills: topSkills, count: topSkills.length },
      'Top in-demand skills retrieved successfully',
      200
    );
  } catch (error) {
    logger.error('Failed to get top skills:', error.message);
    logger.error('Error stack:', error.stack);
    return errorResponse(res, error.message || 'Failed to retrieve top skills', 500);
  }
};

const aggregateSkillDemand = async (req, res) => {
  try {
    const { skill } = req.params;

    logger.info(`On-demand aggregation for skill: ${skill}`);

    const demandData = await marketService.aggregateSkillDemand(skill);
    await marketService.storeSkillDemand(skill, demandData);

    return successResponse(
      res,
      demandData,
      `Demand data aggregated for ${skill}`,
      200
    );
  } catch (error) {
    logger.error('Failed to aggregate skill demand:', error);
    return errorResponse(res, error.message || 'Failed to aggregate skill demand', 500);
  }
};

module.exports = {
  syncSkillDemand,
  getSkillDemand,
  getTopSkills,
  aggregateSkillDemand,
};
