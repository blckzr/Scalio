const express = require('express');
const router = express.Router();
const LessonsController = require('../controllers/lessons.controller');
const { authMiddleware } = require('../middleware/authMiddleware'); 

router.use(authMiddleware);

router.get('/:lessonId', LessonsController.getLessonById);

//router.patch('/:lessonId/complete', LessonsController.markLessonComplete);

module.exports = router;