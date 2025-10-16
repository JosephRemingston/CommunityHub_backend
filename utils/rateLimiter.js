// utils/rateLimiter.js
import rateLimit from "express-rate-limit";

// Limit login attempts
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 attempts per IP
  message: "Too many login attempts. Try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Limit signup requests
export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // max 10 signups per IP per hour
  message: "Too many signup attempts from this IP. Try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Limit forgot-password requests
export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // max 5 reset requests per IP per hour
  message: "Too many password reset requests. Try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});