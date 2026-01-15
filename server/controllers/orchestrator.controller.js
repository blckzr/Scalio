const orchestratorService = require('../services/orchestrator.service');
const logger = require('../utils/logger');

exports.routeMessage = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { message, context = {} } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const result = await orchestratorService.routeIntent(userId, message, context);

    res.status(200).json(result);

  } catch (error) {
    logger.error('Route message error', { error: error.message, userId: req.user.user_id });
    res.status(500).json({
      success: false,
      error: 'Failed to route message',
      details: error.message
    });
  }
};

exports.getSmartSuggestions = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const userContext = req.body.context || {};

    const suggestions = await orchestratorService.getSmartSuggestions(userId, userContext);

    res.status(200).json({
      success: true,
      suggestions,
      count: suggestions.length
    });

  } catch (error) {
    logger.error('Get suggestions error', { error: error.message, userId: req.user.user_id });
    res.status(500).json({
      success: false,
      error: 'Failed to get suggestions',
      details: error.message
    });
  }
};

exports.getProactiveCheckIns = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const userState = req.body.state || {};

    const checkIns = await orchestratorService.proactiveCheckIn(userId, userState);

    res.status(200).json({
      success: true,
      check_ins: checkIns,
      count: checkIns.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get check-ins error', { error: error.message, userId: req.user.user_id });
    res.status(500).json({
      success: false,
      error: 'Failed to get check-ins',
      details: error.message
    });
  }
};

exports.analyzeIntent = async (req, res) => {
  try {
    const { message, context = {} } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const intentAnalysis = await orchestratorService.analyzeIntent(message, context);

    res.status(200).json({
      success: true,
      intent_analysis: intentAnalysis
    });

  } catch (error) {
    logger.error('Analyze intent error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to analyze intent',
      details: error.message
    });
  }
};