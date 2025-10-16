import express from "express";
import {
  signup,
  verifyOTP,
  login,
  forgotPassword,
  resetPassword,
  logout,
} from "../controllers/authController.js";

import {
  loginLimiter,
  signupLimiter,
  forgotPasswordLimiter,
} from "../utils/rateLimiter.js";

const router = express.Router();

router.post("/signup", signupLimiter, signup);
router.post("/verify-otp", verifyOTP);
router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
