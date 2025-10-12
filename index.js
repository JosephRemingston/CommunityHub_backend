import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import serverless from "@vendia/serverless-express";

// Create Express app
const app = express();

const corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));

// Simple route
app.get("/", (req, res) => {
  res.send("server");
});


// Export Lambda handler
export const handler = serverless({ app });
