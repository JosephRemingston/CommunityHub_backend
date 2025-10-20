import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/userModels.js";
import { makeLog } from "../utils/logentries.js";

export const isAuthenticated = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw ApiError.unauthorized("Authentication required. Please login.");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id).select("-password -emailOTP -otpExpiry -resetToken -resetTokenExpiry");
    
    if (!user) {
      throw ApiError.unauthorized("User not found.");
    }

    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw ApiError.unauthorized("Authentication token expired. Please login again.");
    }
    throw ApiError.unauthorized("Invalid authentication token.");
  }
});

export const isAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized("Authentication required. Please login.");
  }

  if (req.user.userType !== "admin") {
    await makeLog(`Unauthorized admin access attempt: ${req.user.email}`, "AdminError", process.env.errorLogs);
    throw ApiError.unauthorized("Admin access required.");
  }

  next();
});

// Middleware for routes requiring admin authentication
export const adminAuth = [isAuthenticated, isAdmin];