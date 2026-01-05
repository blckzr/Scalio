import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { AsyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/signup", AsyncHandler(AuthController.signUp));
router.post("/signin", AsyncHandler(AuthController.signIn));
router.post("/resend-verification", AsyncHandler(AuthController.resendVerificationEmail));
router.post("/forgot-password", AsyncHandler(AuthController.forgotPassword));
router.post("/reset-password", AsyncHandler(AuthController.resetPassword));

export default router;
