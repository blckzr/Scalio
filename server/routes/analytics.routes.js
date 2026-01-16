const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analytics.controller');
const { authMiddleware } = require('../middleware/authMiddleware');
const AsyncHandler = require('../utils/asyncHandler');

router.use(authMiddleware);

router.get('/user', AsyncHandler(AnalyticsController.getUserAnalytics));

router.get('/roadmap/:roadmapId', AsyncHandler(AnalyticsController.getRoadmapProgress));

router.post('/track', AsyncHandler(AnalyticsController.trackProgress));

router.get('/stats', AsyncHandler(AnalyticsController.getLearningStats));

module.exports = router;
