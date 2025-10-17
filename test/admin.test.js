// ----------------------------
// Mock dependencies first
// ----------------------------
jest.mock("../controllers/userController.js", () => ({
  createAdmin: jest.fn((req, res) => res.status(200).json({ message: "Admin creation mock" })),
}));

// ----------------------------
// Import after mocks
// ----------------------------
import request from "supertest";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";

import { createAdmin } from "../controllers/userController.js";

// ----------------------------
// Setup express app
// ----------------------------
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.post("/create-admin", createAdmin);

// ----------------------------
// Tests
// ----------------------------
describe("Admin Routes (Mocked)", () => {
  it("POST /create-admin", async () => {
    const res = await request(app)
      .post("/create-admin")
      .send({ email: "admin@test.com", password: "123456", name: "Admin" });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Admin creation mock");
  });
});
