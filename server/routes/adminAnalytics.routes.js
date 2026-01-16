const express = require('express');
const router = express.Router();
const adminAnalyticsController = require('../controllers/adminAnalytics.controller');
const { authMiddleware } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/users', authMiddleware, adminMiddleware, adminAnalyticsController.getUserStatistics);

router.get('/roadmaps', authMiddleware, adminMiddleware, adminAnalyticsController.getRoadmapStatistics);

router.get('/ai-usage', authMiddleware, adminMiddleware, adminAnalyticsController.getAIUsageStatistics);

router.get('/market-trends', authMiddleware, adminMiddleware, adminAnalyticsController.getMarketTrendsStatistics);

router.get('/system-health', authMiddleware, adminMiddleware, adminAnalyticsController.getSystemHealthMetrics);

router.get('/engagement', authMiddleware, adminMiddleware, adminAnalyticsController.getEngagementMetrics);

router.get('/insights', authMiddleware, adminMiddleware, adminAnalyticsController.getAdminInsights);

module.exports = router;
