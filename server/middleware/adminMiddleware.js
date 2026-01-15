const userService = require("../services/user.service")

const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const userRole = await userService.getUserRole(req.user.id)

    if (userRole !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admin access required" })
    }

    next()
  } catch (error) {
    res.status(500).json({ message: "Error checking admin status", error: error.message })
  }
}

module.exports = adminMiddleware
