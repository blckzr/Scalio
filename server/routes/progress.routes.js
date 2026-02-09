const express = require("express");
const router = express.Router();
const ProgressController = require("../controllers/progress.controller");
const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/user", authMiddleware, ProgressController.getUserProgress);
router.get("/path/:pathId", authMiddleware, ProgressController.getPathProgress);
router.get("/module/:moduleId", authMiddleware, ProgressController.getModuleProgress);

module.exports = router;