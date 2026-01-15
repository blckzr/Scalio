const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roadmapVersionController = require('../controllers/roadmapVersion.controller');
const AsyncHandler = require('../utils/asyncHandler');

router.use(authMiddleware);

router.get('/:roadmapId/check-updates',AsyncHandler(roadmapVersionController.checkUpdates));

router.get('/:roadmapId/compare/:newVersion',AsyncHandler(roadmapVersionController.compareVersions));

router.get('/:roadmapId/update-recommendation/:newVersion',AsyncHandler(roadmapVersionController.getRecommendation));

router.post('/:roadmapId/accept-update',AsyncHandler(roadmapVersionController.acceptUpdate));

router.post('/:roadmapId/reject-update',AsyncHandler(roadmapVersionController.rejectUpdate));

router.get('/:roadmapId/migration-history',AsyncHandler(roadmapVersionController.getMigrationHistory));

module.exports = router;
