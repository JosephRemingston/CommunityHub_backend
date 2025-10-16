// utils/rateLimiter.js
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.LOGIN_MAX_ATTEMPTS || 5, // fallback to 5 if env not set
  message: "Too many login attempts. Try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.SIGNUP_MAX_ATTEMPTS || 10, // fallback to 10
  message: "Too many signup attempts from this IP. Try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.FORGOT_PASSWORD_MAX_ATTEMPTS || 5, // fallback to 5
  message: "Too many password reset requests. Try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
