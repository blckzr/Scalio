const express = require('express');
const router = express.Router();
const CoachController = require('../controllers/coach.controller');
const { authMiddleware } = require('../middleware/authMiddleware');
const AsyncHandler = require('../utils/asyncHandler');

router.use(authMiddleware);

router.post('/checkin', AsyncHandler(CoachController.recordCheckIn));

router.get('/stats', AsyncHandler(CoachController.getUserStats));

router.get('/motivation', AsyncHandler(CoachController.getMotivation));

router.get('/sessions', AsyncHandler(CoachController.getRecentSessions));

router.get('/calendar', AsyncHandler(CoachController.getWeeklyCalendar));

router.get('/technique', AsyncHandler(CoachController.getStudyTechnique));

router.post('/pomodoro/start', AsyncHandler(CoachController.startPomodoro));

router.get('/tips', AsyncHandler(CoachController.getStudyTips));

module.exports = router;
