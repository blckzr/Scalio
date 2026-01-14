const express = require("express");
const router = express.Router();
const StudySessionsController = require("../controllers/studySessions.controller");
const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/", authMiddleware, StudySessionsController.createStudySession);
router.get("/user/sessions", authMiddleware, StudySessionsController.getUserStudySessions);
router.get("/user/stats", authMiddleware, StudySessionsController.getStudyStats);
router.get("/lesson/:milestoneId/history", authMiddleware, StudySessionsController.getLessonStudyHistory);

module.exports = router;