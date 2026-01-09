const express = require("express")
const router = express.Router()
const { authMiddleware } = require("../middleware/authMiddleware")
const adminMiddleware = require("../middleware/adminMiddleware")
const AdminController = require("../controllers/admin.controller")

router.get("/users", authMiddleware, adminMiddleware, AdminController.getAllUsers)
router.get("/users/:userId", authMiddleware, adminMiddleware, AdminController.getUserById)
router.delete("/users/:userId", authMiddleware, adminMiddleware, AdminController.deleteUser)
router.put("/users/:userId/role", authMiddleware, adminMiddleware, AdminController.updateUserRole)
router.get("/stats", authMiddleware, adminMiddleware, AdminController.getStats)

module.exports = router