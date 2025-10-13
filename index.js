import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import serverlessExpress from "@vendia/serverless-express";

const app = express();

app.use(cors({ origin: "*" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Simple route
app.get("/", (req, res) => {
  res.json({ message: "Lambda Express is working!" });
});

// Export the Lambda handler
export const handler = serverlessExpress(app);