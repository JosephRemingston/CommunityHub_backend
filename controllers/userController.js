import User from "../models/userModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import bcrypt from "bcrypt";

export const createAdmin = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return ApiResponse.badRequest(res, "Email already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await User.create({
    email,
    password: hashedPassword,
    name,
    userType: "admin",
    verified: true,
  });

  ApiResponse.success(res, "Admin created successfully", { email: admin.email, name: admin.name });
});
