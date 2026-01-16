const express = require('express');
const router = express.Router();
const RoadmapController = require('../controllers/roadmap.controller');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, RoadmapController.getUserRoadmaps);
router.get('/:roadmapId', authMiddleware, RoadmapController.getRoadmapById);
router.post('/', authMiddleware, RoadmapController.createRoadmap);
router.get('/progress/:roadmapId', authMiddleware, RoadmapController.getRoadmapWithProgress);

module.exports = router;
