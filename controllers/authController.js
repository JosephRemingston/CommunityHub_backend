import User from "../models/userModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../utils/mailer.js";
import { generateOTP } from "../utils/otp.js";

// Signup
export const signup = asyncHandler(async (req, res) => {
  const { email, password, name, userType } = req.body;

  if (!["backer", "creator"].includes(userType)) return ApiResponse.badRequest(res, "Invalid role");

  const existing = await User.findOne({ email });
  if (existing) return ApiResponse.badRequest(res, "Email already exists");

  const otp = generateOTP();
  const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

  const user = await User.create({
    email,
    password,
    name,
    userType,
    emailOTP: otp,
    otpExpiry,
  });

  await sendEmail(email, "Verify your email", `Your OTP is: ${otp}. It expires in 10 minutes.`);

  ApiResponse.success(res, "Signup successful. Check your email for OTP");
});

// Verify OTP
export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) return ApiResponse.badRequest(res, "User not found");
  if (user.verified) return ApiResponse.badRequest(res, "Already verified");

  if (user.emailOTP !== otp) return ApiResponse.badRequest(res, "Invalid OTP");
  if (user.otpExpiry < Date.now()) return ApiResponse.badRequest(res, "OTP expired");

  user.verified = true;
  user.emailOTP = undefined;
  user.otpExpiry = undefined;
  await user.save();

  ApiResponse.success(res, "Email verified successfully");
});

// Login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return ApiResponse.badRequest(res, "Invalid credentials");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return ApiResponse.badRequest(res, "Invalid credentials");

  if (!user.verified) return ApiResponse.badRequest(res, "Email not verified");

  const token = jwt.sign(
    { id: user._id, role: user.userType },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  // === Set JWT as HTTP-only cookie ===
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "strict", // prevents CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  ApiResponse.success(res, "Login successful", {
    user: {
      email: user.email,
      name: user.name,
      userType: user.userType,
    },
  });
});

// Logout
export const logout = asyncHandler(async (req, res) => {
  // Clear the token cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // only HTTPS in prod
    sameSite: "strict",
  });

  ApiResponse.success(res, "Logged out successfully");
});


// Forgot Password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return ApiResponse.badRequest(res, "Email not found");

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetToken = resetToken;
  user.resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  const resetLink = `${process.env.APP_URL}/reset-password/${resetToken}`;
  await sendEmail(email, "Reset Password", `Click here to reset password: ${resetLink}`);

  ApiResponse.success(res, "Password reset link sent to email");
});

// Reset Password
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
  if (!user) return ApiResponse.badRequest(res, "Invalid or expired token");

  user.password = password;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  ApiResponse.success(res, "Password reset successfully");
});
