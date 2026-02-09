const express = require('express');
const router = express.Router();
const {authMiddleware} = require('../middleware/authMiddleware');
const trendsController = require('../controllers/trends.controller');
const AsyncHandler = require('../utils/asyncHandler');

router.get('/industry-insights',AsyncHandler(trendsController.getIndustryInsights));

router.get('/global-trends',AsyncHandler(trendsController.getGlobalTrends));

router.get('/trending',AsyncHandler(trendsController.getTrendingTechnologies));

router.get('/salary-benchmarks',AsyncHandler(trendsController.getSalaryBenchmarks));

router.get('/forecast',AsyncHandler(trendsController.getTechForecast));

router.get('/intelligence/:technology',AsyncHandler(trendsController.getMarketIntelligence));

router.use(authMiddleware);

router.post('/forecast/generate',AsyncHandler(trendsController.generateTechForecast));

router.post('/industry-insights',AsyncHandler(trendsController.addIndustryInsight));

router.post('/global-trends',AsyncHandler(trendsController.addGlobalTrend));

module.exports = router;
