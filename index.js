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

// Connect to MongoDB
connectDB();

const app = express();

// CORS Configuration
// When using HTTP-only cookies, origin cannot be "*"
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // allows cookies to be sent/received
  })
);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Lambda Express is working!" });
});

// Auth & User routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Local Development Server
// Uncomment to run locally
// const PORT = process.env.PORT || 8000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

// Export for AWS Lambda
export default app;
