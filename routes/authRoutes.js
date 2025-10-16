import express from "express";
import {
  signup,
  verifyOTP,
  login,
  forgotPassword,
  resetPassword,
  logout,
} from "../controllers/authController.js";

import { loginLimiter, signupLimiter, forgotPasswordLimiter } from "../utils/rateLimiter.js";

const router = express.Router();

router.post("/signup", signupLimiter, signup);// rate limit to prevent abuse
router.post("/verify-otp", verifyOTP); // no limiter needed usually
router.post("/login", loginLimiter, login); // rate limit to prevent brute-force
router.post("/logout", logout);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
