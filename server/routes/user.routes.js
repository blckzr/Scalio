const express = require("express")
const router = express.Router()
const { authMiddleware } = require("../middleware/authMiddleware")
const UserController = require("../controllers/user.controller")

router.get("/profile", authMiddleware, UserController.getProfile)
router.get("/recommended-roadmaps", authMiddleware, UserController.getRecommendedRoadmaps);

module.exports = router