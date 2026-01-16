const express = require('express');
const router = express.Router();
const ResourceController = require('../controllers/resource.controller');
const { authMiddleware } = require('../middleware/authMiddleware');
const AsyncHandler = require('../utils/asyncHandler');

router.get('/recommendations', authMiddleware, AsyncHandler(ResourceController.getRecommendations));

router.get('/by-skill/:skillName', AsyncHandler(ResourceController.getResourcesBySkill));

router.get('/learning-path/:skillName', AsyncHandler(ResourceController.getLearningPath));

router.post('/add', AsyncHandler(ResourceController.addResource));

module.exports = router;
