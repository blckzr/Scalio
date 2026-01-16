const { Router } = require('express');
const AssessmentController = require('../controllers/assessment.controller');
const { authMiddleware } = require('../middleware/authMiddleware');
const AsyncHandler = require('../utils/asyncHandler');

const router = Router();

router.use(authMiddleware);

router.post('/submit', AsyncHandler(AssessmentController.submitAssessment));

router.get('/user', AsyncHandler(AssessmentController.getUserAssessments));

router.post('/quick', AsyncHandler(AssessmentController.quickAssessment));

router.patch('/skill/:skillId', AsyncHandler(AssessmentController.updateAssessment));

router.delete('/skill/:skillId', AsyncHandler(AssessmentController.deleteAssessment));

module.exports = router;
