const express = require("express");
const router = express.Router();
const NotificationController = require("../controllers/notification.controller");
const { authMiddleware } = require("../middleware/authMiddleware");
const AsyncHandler = require("../utils/asyncHandler");

// All routes require authentication
router.use(authMiddleware);

router.get("/", AsyncHandler(NotificationController.getNotifications));

router.get("/unread-count",AsyncHandler(NotificationController.getUnreadCount));

router.patch("/:id/read", AsyncHandler(NotificationController.markAsRead));

router.patch("/mark-all-read",AsyncHandler(NotificationController.markAllAsRead));

router.delete("/:id", AsyncHandler(NotificationController.deleteNotification));

router.post("/create", AsyncHandler(NotificationController.createNotification));

module.exports = router;
