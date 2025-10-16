import mongoose from "mongoose";
import bcrypt from "bcrypt";
import typeOfUsers from "../utils/constants.js";

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      trim: true,
      default: null,
    },
    userType: {
      type: String,
      enum: typeOfUsers,
      default: "innovator",
    },
    email: {
      type: String,
      required: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    verified: {
      type: Boolean,
      required: true,
      default: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: 30,
      minLength: 2,
      default: null,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    emailOTP: String,
    otpExpiry: Date,
    resetToken: String,
    resetTokenExpiry: Date,
  },
  { timestamps: true }
);

// hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// method to compare passwords
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

const userModel = mongoose.model("user", userSchema);
export default userModel;
