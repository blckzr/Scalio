const express = require("express");
const router = express.Router();
const LessonsController = require("../controllers/lessons.controller");
const { authMiddleware } = require("../middleware/authMiddleware");

// Route used to get details for a specific module/lesson instance
router.get("/module/:moduleId", LessonsController.getLessonsByModule);

router.get("/:lessonId", LessonsController.getLessonById);
router.get("/:lessonId/next", LessonsController.getNextLesson);
router.post("/:lessonId/complete", authMiddleware, LessonsController.markLessonComplete);

module.exports = router;