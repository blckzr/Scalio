
const adminAnalyticsService = require('../services/adminAnalytics.service');
const logger = require('../utils/logger');

exports.getUserStatistics = async (req, res) => {
  try {
    const stats = await adminAnalyticsService.getUserStatistics();

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Get user statistics error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to get user statistics',
      details: error.message
    });
  }
};

exports.getRoadmapStatistics = async (req, res) => {
  try {
    const stats = await adminAnalyticsService.getRoadmapStatistics();

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Get roadmap statistics error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to get roadmap statistics',
      details: error.message
    });
  }
};

exports.getAIUsageStatistics = async (req, res) => {
  try {
    const stats = await adminAnalyticsService.getAIUsageStatistics();

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Get AI usage statistics error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to get AI usage statistics',
      details: error.message
    });
  }
};

exports.getMarketTrendsStatistics = async (req, res) => {
  try {
    const stats = await adminAnalyticsService.getMarketTrendsStatistics();

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Get market trends statistics error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to get market trends statistics',
      details: error.message
    });
  }
};

exports.getSystemHealthMetrics = async (req, res) => {
  try {
    const metrics = await adminAnalyticsService.getSystemHealthMetrics();

    res.status(200).json({
      success: true,
      data: metrics
    });

  } catch (error) {
    logger.error('Get system health error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to get system health metrics',
      details: error.message
    });
  }
};

exports.getEngagementMetrics = async (req, res) => {
  try {
    const metrics = await adminAnalyticsService.getEngagementMetrics();

    res.status(200).json({
      success: true,
      data: metrics
    });

  } catch (error) {
    logger.error('Get engagement metrics error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to get engagement metrics',
      details: error.message
    });
  }
};

exports.getAdminInsights = async (req, res) => {
  try {
    const insights = await adminAnalyticsService.generateAdminInsights();

    res.status(200).json({
      success: true,
      data: insights
    });

  } catch (error) {
    logger.error('Get admin insights error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to generate admin insights',
      details: error.message
    });
  }
};