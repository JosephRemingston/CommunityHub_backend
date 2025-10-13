import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();

app.use(cors({ origin: "*" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Simple route
app.get("/", (req, res) => {
  res.json({ message: "Lambda Express is working!" });
});


//app.listen(8000 , () => {
//  console.log("server");
//})
// Export the Lambda handler

export default app;