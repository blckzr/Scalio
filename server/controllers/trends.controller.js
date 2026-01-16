const trendsService = require('../services/trends.service');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

class TrendsController {
  async getIndustryInsights(req, res) {
    try {
      const { year, source, category, limit } = req.query;
      
      const insights = await trendsService.getIndustryInsights({
        year: year ? parseInt(year) : undefined,
        source,
        category,
        limit: limit ? parseInt(limit) : 10
      });

      return successResponse(res, { insights, total: insights.length }, 'Industry insights retrieved');
    } catch (error) {
      logger.error('Error in getIndustryInsights:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async getGlobalTrends(req, res) {
    try {
      const { source, metric_type, technology, trend_direction, limit } = req.query;

      const trends = await trendsService.getGlobalTrends({
        source,
        metric_type,
        technology,
        trend_direction,
        limit: limit ? parseInt(limit) : 20
      });

      return successResponse(res, { trends, total: trends.length }, 'Global trends retrieved');
    } catch (error) {
      logger.error('Error in getGlobalTrends:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async getTrendingTechnologies(req, res) {
    try {
      const { limit } = req.query;

      const trending = await trendsService.getTrendingTechnologies(
        limit ? parseInt(limit) : 10
      );

      return successResponse(res, { trending_technologies: trending }, 'Trending technologies retrieved');
    } catch (error) {
      logger.error('Error in getTrendingTechnologies:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async getSalaryBenchmarks(req, res) {
    try {
      const { skill_name, experience_level } = req.query;

      if (!skill_name) {
        return errorResponse(res, 'skill_name query parameter is required', 400);
      }

      const benchmarks = await trendsService.getSalaryBenchmarks({
        skill_name,
        experience_level
      });

      return successResponse(res, { benchmarks, total: benchmarks.length }, 'Salary benchmarks retrieved');
    } catch (error) {
      logger.error('Error in getSalaryBenchmarks:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async getTechForecast(req, res) {
    try {
      const { technology_name, forecast_horizon } = req.query;

      if (!technology_name) {
        return errorResponse(res, 'technology_name query parameter is required', 400);
      }

      const forecast = await trendsService.getTechForecast({
        technology_name,
        forecast_horizon
      });

      return successResponse(res, { forecast }, 'Technology forecast retrieved');
    } catch (error) {
      logger.error('Error in getTechForecast:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async generateTechForecast(req, res) {
    try {
      const { technology_name } = req.body;

      if (!technology_name) {
        return errorResponse(res, 'technology_name is required', 400);
      }

      const forecast = await trendsService.generateTechForecast(technology_name);

      return successResponse(res, forecast, 'AI-powered forecast generated', 201);
    } catch (error) {
      logger.error('Error in generateTechForecast:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async getMarketIntelligence(req, res) {
    try {
      const { technology } = req.params;

      const intelligence = await trendsService.getMarketIntelligence(technology);

      return successResponse(res, intelligence, 'Market intelligence compiled');
    } catch (error) {
      logger.error('Error in getMarketIntelligence:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async addIndustryInsight(req, res) {
    try {
      const insightData = req.body;

      const insight = await trendsService.addIndustryInsight(insightData);

      return successResponse(res, insight, 'Industry insight added', 201);
    } catch (error) {
      logger.error('Error in addIndustryInsight:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async addGlobalTrend(req, res) {
    try {
      const trendData = req.body;

      const trend = await trendsService.addGlobalTrend(trendData);

      return successResponse(res, trend, 'Global trend added', 201);
    } catch (error) {
      logger.error('Error in addGlobalTrend:', error);
      return errorResponse(res, error.message, 500);
    }
  }
}

module.exports = new TrendsController();
