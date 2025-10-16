import User from "../models/userModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import bcrypt from "bcrypt";
import { makeLog } from "../utils/logentries.js";

// Create Admin
export const createAdmin = asyncHandler(async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      await makeLog(`Admin creation failed: Email exists ${email}`, "AdminError", process.env.errorLogs);
      throw ApiError.badRequest("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await User.create({ email, password: hashedPassword, name, userType: "admin", verified: true });

    await makeLog(`Admin created successfully: ${email}`, "AdminEvent", process.env.errorLogs);
    ApiResponse.success(res, "Admin created successfully", { email: admin.email, name: admin.name });
  } catch (err) {
    if (err instanceof ApiError) throw err;
    await makeLog(`Admin creation failed: ${err.message}`, "AdminError", process.env.errorLogs);
    throw new ApiError(500, `Admin creation failed: ${err.message}`);
  }
});