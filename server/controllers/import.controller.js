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

    // Get admin user from auth middleware
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

const importWithIntelligence = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { title, description, category, roadmap_data, source_type, source_url } = req.body;

    // Get admin user from auth middleware
    const created_by = req.user?.user_id || null;

    logger.info(`Admin importing roadmap with intelligence: ${title}`);

    const result = await importService.importWithIntelligence({
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

    logger.success(`Roadmap imported with intelligence: ${title} (pending review)`);
    
    return successResponse(
      res,
      result.data,
      'Roadmap imported successfully. Review intelligence insights before publishing.',
      201
    );

  } catch (error) {
    logger.error(`Import with intelligence error: ${error.message}`);
    next(error);
  }
};

const analyzeRoadmap = async (req, res, next) => {
  try {
    const { roadmap_data } = req.body;

    if (!roadmap_data) {
      return errorResponse(res, 'Roadmap data is required', 400);
    }

    logger.info('Analyzing roadmap intelligence...');

    const intelligence = await importService.analyzeRoadmapIntelligence(roadmap_data);

    if (intelligence.error) {
      return errorResponse(res, intelligence.error, 500, intelligence.details);
    }

    return successResponse(
      res,
      intelligence,
      'Intelligence analysis complete',
      200
    );

  } catch (error) {
    logger.error(`Analyze roadmap error: ${error.message}`);
    next(error);
  }
};

const publishRoadmap = async (req, res, next) => {
  try {
    const { template_id } = req.params;
    const { admin_notes, skill_changes } = req.body;

    if (!template_id) {
      return errorResponse(res, 'Template ID is required', 400);
    }

    logger.info(`Admin publishing roadmap: ${template_id}`);

    const result = await importService.publishRoadmap(template_id, {
      notes: admin_notes,
      skill_changes: skill_changes || []
    });

    if (result.error) {
      return errorResponse(res, result.error, 400, result.details);
    }

    logger.success(`Roadmap published: ${result.data.title}`);

    return successResponse(
      res,
      result.data,
      'Roadmap published successfully',
      200
    );

  } catch (error) {
    logger.error(`Publish roadmap error: ${error.message}`);
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
  importWithIntelligence,
  analyzeRoadmap,
  publishRoadmap,
  validateRoadmap,
  getImportHistory
};