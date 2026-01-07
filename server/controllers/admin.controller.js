const userService = require("../services/user.service")
const asyncHandler = require("../utils/asyncHandler")

const AdminController = {
  // Get all users
  getAllUsers: asyncHandler(async (req, res) => {
    const users = await userService.getAllUsers()
    res.status(200).json({ users })
  }),

  // Get specific user by ID
  getUserById: asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" })
    }

    const user = await userService.getUserById(userId)
    res.status(200).json({ user })
  }),

  // Delete user (admin only)
  deleteUser: asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" })
    }

    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({ message: "Cannot delete your own account" })
    }

    await userService.deleteUser(userId)
    res.status(200).json({ message: "User deleted successfully" })
  }),

  // Update user role (admin only)
  updateUserRole: asyncHandler(async (req, res) => {
    const { userId } = req.params
    const { role } = req.body

    if (!userId || !role) {
      return res.status(400).json({ message: "User ID and role are required" })
    }

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be "user" or "admin"' })
    }

    const updatedUser = await userService.updateUser(userId, { role })
    res.status(200).json({ message: "User role updated successfully", user: updatedUser })
  }),

  // Get system stats (admin only)
  getStats: asyncHandler(async (req, res) => {
    const users = await userService.getAllUsers()
    const totalUsers = users.length
    const adminCount = users.filter((u) => u.role === "admin").length

    res.status(200).json({
      stats: {
        totalUsers,
        adminCount,
        regularUsers: totalUsers - adminCount,
      },
    })
  }),
}

module.exports = AdminController
