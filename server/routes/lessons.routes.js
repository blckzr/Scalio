const express = require('express');
const router = express.Router();
const LessonsController = require('../controllers/lessons.controller');
const { authMiddleware } = require('../middleware/authMiddleware'); 

router.use(authMiddleware);

// 1. Get List of Lessons for a specific Roadmap
// Usage: When user clicks "View Roadmap" on the dashboard
router.get('/roadmap/:roadmapId', LessonsController.getRoadmapLessons);

// 2. Get Single Lesson Detail
// Usage: When user clicks a specific item in the lesson list
router.get('/:lessonId', LessonsController.getLessonById);

module.exports = router;