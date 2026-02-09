const express = require('express');
const router = express.Router();
const userRoadmapController = require('../controllers/userRoadmap.controller');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', userRoadmapController.createUserRoadmap);

router.get('/', userRoadmapController.getUserRoadmaps);

router.get('/:roadmap_id', userRoadmapController.getUserRoadmapById);

router.get('/:roadmap_id/stats', userRoadmapController.getRoadmapStats);

router.get('/:roadmap_id/updates', userRoadmapController.checkVersionUpdates);

router.patch('/modules/:module_id', userRoadmapController.updateModuleStatus);

router.post('/updates/:update_id/respond', userRoadmapController.respondToVersionUpdate);

router.delete('/:roadmap_id', userRoadmapController.deleteUserRoadmap);

module.exports = router;
