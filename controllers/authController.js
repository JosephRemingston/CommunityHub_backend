import User from "../models/userModels.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../utils/mailer.js";
import { generateOTP } from "../utils/otp.js";
import typeOfUsers from "../utils/constants.js";
import { makeLog } from "../utils/logentries.js";

// Signup
export const signup = asyncHandler(async (req, res) => {
  try {
    const { email, password, name, userType } = req.body;

    if (!typeOfUsers.includes(userType)) {
      await makeLog(`Invalid signup role attempted: ${userType}`, "AuthError", process.env.errorLogs);
      throw ApiError.badRequest("Invalid role");
    }

    const existing = await User.findOne({ email });
    if (existing) {
      await makeLog(`Signup attempt with existing email: ${email}`, "AuthError", process.env.errorLogs);
      throw ApiError.badRequest("Email already exists");
    }

    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 min

    const user = await User.create({
      email,
      password,
      name,
      userType,
      emailOTP: otp,
      otpExpiry,
    });

    await sendEmail(email, "Verify your email", `Your OTP is: ${otp}. It expires in 10 minutes.`);
    await makeLog(`OTP sent to email: ${email}`, "AuthEvent", process.env.errorLogs);

    ApiResponse.success(res, "Signup successful. Check your email for OTP");
  } catch (err) {
    if (err instanceof ApiError) throw err;
    await makeLog(`Signup failed: ${err.message}`, "AuthError", process.env.errorLogs);
    throw new ApiError(500, `Signup failed: ${err.message}`);
  }
});

// Verify OTP
export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    await makeLog(`OTP verification failed: User not found ${email}`, "AuthError", process.env.errorLogs);
    throw ApiError.badRequest("User not found");
  }
  if (user.verified) throw ApiError.badRequest("Already verified");

  if (user.emailOTP !== otp) throw ApiError.badRequest("Invalid OTP");
  if (user.otpExpiry < Date.now()) throw new ApiError(400, "OTP expired");

  user.verified = true;
  user.emailOTP = undefined;
  user.otpExpiry = undefined;
  await user.save();
  await makeLog(`Email verified: ${email}`, "AuthEvent", process.env.errorLogs);

  ApiResponse.success(res, "Email verified successfully");
});

// Login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    await makeLog(`Login failed: Invalid email ${email}`, "AuthError", process.env.errorLogs);
    throw ApiError.badRequest("Invalid credentials");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    await makeLog(`Login failed: Invalid password for ${email}`, "AuthError", process.env.errorLogs);
    throw ApiError.badRequest("Invalid credentials");
  }

  if (!user.verified) throw ApiError.badRequest("Email not verified");

  const token = jwt.sign({ id: user._id, role: user.userType }, process.env.JWT_SECRET, { expiresIn: "7d" });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  await makeLog(`User logged in: ${email}`, "AuthEvent", process.env.errorLogs);
  ApiResponse.success(res, "Login successful", { user: { email: user.email, name: user.name, userType: user.userType } });
});

// Logout
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" });
  ApiResponse.success(res, "Logged out successfully");
  await makeLog(`User logged out`, "AuthEvent", process.env.errorLogs);
});

// Forgot Password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw ApiError.badRequest("Email not found");

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetToken = resetToken;
  user.resetTokenExpiry = Date.now() + 60 * 60 * 1000;
  await user.save();

  const resetLink = `${process.env.APP_URL}/reset-password/${resetToken}`;
  await sendEmail(email, "Reset Password", `Click here to reset password: ${resetLink}`);
  await makeLog(`Password reset requested for: ${email}`, "AuthEvent", process.env.errorLogs);

  ApiResponse.success(res, "Password reset link sent to email");
});

// Reset Password
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
  if (!user) throw ApiError.badRequest("Invalid or expired token");

  user.password = password;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();
  await makeLog(`Password reset successfully for: ${user.email}`, "AuthEvent", process.env.errorLogs);

  ApiResponse.success(res, "Password reset successfully");
});
