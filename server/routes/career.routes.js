const express = require('express');
const router = express.Router();
const CareerController = require('../controllers/career.controller');
const { authMiddleware } = require('../middleware/authMiddleware');
const AsyncHandler = require('../utils/asyncHandler');

router.use(authMiddleware);

router.get('/insights', AsyncHandler(CareerController.getCareerInsights));

router.get('/salary-prediction', AsyncHandler(CareerController.predictSalary));

router.get('/skill-gap', AsyncHandler(CareerController.analyzeSkillGap));

module.exports = router;
