const importService = require('../services/import.service');
const { validationResult } = require('express-validator');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

const importRoadmap = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { title, description, category, roadmap_data, source_type, source_url } = req.body;

    // TODO: Get admin user from auth middleware (req.user)
    // For now, using NULL since we don't have real auth (allowed by schema)
    const created_by = req.user?.user_id || null;

    const result = await importService.importRoadmap({
      title,
      description,
      category,
      roadmap_data,
      source_type: source_type || 'roadmap.sh',
      source_url: source_url || null,
      created_by
    });

    if (result.error) {
      return errorResponse(res, result.error, 400, result.details);
    }

    logger.success(`Roadmap imported: ${title} v${result.data.version} (ID: ${result.data.roadmap_id})`);
    return successResponse(
      res,
      result.data,
      `Roadmap "${title}" v${result.data.version} imported successfully`,
      201
    );

  } catch (error) {
    logger.error(`Import roadmap error: ${error.message}`);
    next(error);
  }
};

const validateRoadmap = async (req, res, next) => {
  try {
    const { roadmap_data } = req.body;

    if (!roadmap_data) {
      return errorResponse(res, 'Roadmap data is required', 400);
    }

    const result = importService.validateOnly(roadmap_data);

    if (result.valid) {
      return successResponse(
        res,
        {
          valid: true,
          stats: result.stats,
          warnings: result.warnings || []
        },
        'Roadmap structure is valid'
      );
    } else {
      return errorResponse(
        res,
        'Invalid roadmap structure',
        400,
        result.errors
      );
    }

  } catch (error) {
    logger.error(`Validate roadmap error: ${error.message}`);
    next(error);
  }
};

const getImportHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, source_type, category } = req.query;

    const result = await importService.getImportHistory({
      page: parseInt(page),
      limit: parseInt(limit),
      source_type,
      category
    });

    if (result.error) {
      return errorResponse(res, result.error, 500, result.details);
    }

    return successResponse(res, result.data, 'Import history retrieved successfully');

  } catch (error) {
    logger.error(`Get import history error: ${error.message}`);
    next(error);
  }
};

module.exports = {
  importRoadmap,
  validateRoadmap,
  getImportHistory
};