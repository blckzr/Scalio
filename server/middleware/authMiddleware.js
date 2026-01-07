const { supabase } = require("../config/database")

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No authorization token provided" })
    }

    const token = authHeader.slice(7) // Remove "Bearer " prefix

    // Verify the token with Supabase
    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
      return res.status(401).json({ message: "Invalid or expired token" })
    }

    // Attach user to request for use in controllers
    req.user = data.user
    next()
  } catch (err) {
    res.status(401).json({ message: "Authentication failed" })
  }
}

module.exports = { authMiddleware }
