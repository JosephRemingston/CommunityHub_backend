import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// Connect to MongoDB
connectDB();

const app = express();

// CORS Configuration
// Use FRONTEND_URL from .env
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // allow cookies to be sent
  })
);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Simple route
app.get("/", (req, res) => {
  res.json({ message: "Lambda Express is working!" });
});

// Auth & User routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

// Local Development Server
// Uncomment to run locally
// const PORT = process.env.PORT || 8000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

// Export for AWS Lambda
export default app;
