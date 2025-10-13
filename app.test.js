import request from "supertest";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

// Create app for testing
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "Lambda Express is working!" });
});

describe("Basic Express Routes", () => {
  test("GET / should return working message", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Lambda Express is working!");
  });
});