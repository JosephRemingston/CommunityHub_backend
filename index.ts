import express, { type Request, type Response } from "express";

const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send("server");
});

app.listen(3000, () => {
  console.log("server");
});