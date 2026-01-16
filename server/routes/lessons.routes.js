const express = require('express');
const router = express.Router();
const LessonsController = require('../controllers/lessons.controller');
const { authMiddleware } = require('../middleware/authMiddleware'); // Ensure this path is correct

// Protect all lesson routes
router.use(authMiddleware);

// 1. Get Lesson Details (Matches: GET /api/lessons/:lessonId)
// This maps to the getLessonById function in your new controller
router.get('/:lessonId', LessonsController.getLessonById);

// 2. Mark Lesson as Complete (Matches: PATCH /api/lessons/:lessonId/complete)
// This maps to the markLessonComplete function in your new controller
router.patch('/:lessonId/complete', LessonsController.markLessonComplete);

module.exports = router;