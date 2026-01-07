const { Router } = require("express")
const { AuthController } = require("../controllers/auth.controller")
const AsyncHandler = require("../utils/asyncHandler")
const { authMiddleware } = require("../middleware/authMiddleware")

const router = Router()

// Public endpoints
router.post("/signup", AsyncHandler(AuthController.signUp))
router.post("/signin", AsyncHandler(AuthController.signIn))
router.post("/resend-verification", AsyncHandler(AuthController.resendVerificationEmail))
router.post("/forgot-password", AsyncHandler(AuthController.forgotPassword))
router.post("/reset-password", AsyncHandler(AuthController.resetPassword))
router.post("/refresh-token", AsyncHandler(AuthController.refreshToken))

// Protected endpoints
router.get("/current-user", authMiddleware, AsyncHandler(AuthController.getCurrentUser))
router.post("/logout", authMiddleware, AsyncHandler(AuthController.logout))

module.exports = router