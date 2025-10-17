// ----------------------------
// Mock dependencies first
// ----------------------------
jest.mock("../controllers/authController.js", () => ({
  signup: jest.fn((req, res) => res.status(200).json({ message: "Signup mock" })),
  verifyOTP: jest.fn((req, res) => res.status(200).json({ message: "Verify OTP mock" })),
  login: jest.fn((req, res) => res.status(200).json({ message: "Login mock" })),
  logout: jest.fn((req, res) => res.status(200).json({ message: "Logout mock" })),
  forgotPassword: jest.fn((req, res) => res.status(200).json({ message: "Forgot Password mock" })),
  resetPassword: jest.fn((req, res) => res.status(200).json({ message: "Reset Password mock" })),
}));

jest.mock("../utils/mailer.js", () => ({
  sendEmail: jest.fn(() => Promise.resolve("Email sent")),
}));

// ----------------------------
// Import after mocks
// ----------------------------
import request from "supertest";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";

import {
  signup,
  verifyOTP,
  login,
  logout,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

// ----------------------------
// Setup express app
// ----------------------------
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.post("/signup", signup);
app.post("/verify-otp", verifyOTP);
app.post("/login", login);
app.post("/logout", logout);
app.post("/forgot-password", forgotPassword);
app.post("/reset-password/:token", resetPassword);

// ----------------------------
// Tests
// ----------------------------
describe("Auth Routes (Mocked)", () => {
  it("POST /signup", async () => {
    const res = await request(app).post("/signup").send({ email: "test@test.com" });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Signup mock");
  });

  it("POST /login", async () => {
    const res = await request(app).post("/login").send({ email: "test@test.com" });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Login mock");
  });

  it("POST /logout", async () => {
    const res = await request(app).post("/logout");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Logout mock");
  });

  it("POST /verify-otp", async () => {
    const res = await request(app).post("/verify-otp").send({ otp: "123456" });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Verify OTP mock");
  });

  it("POST /forgot-password", async () => {
    const res = await request(app).post("/forgot-password").send({ email: "test@test.com" });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Forgot Password mock");
  });

  it("POST /reset-password/:token", async () => {
    const res = await request(app).post("/reset-password/abc123").send({ password: "123456" });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Reset Password mock");
  });
});
