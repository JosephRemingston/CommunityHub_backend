import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();

const corsOptions = {
    origin: "*"
};

app.use(cors(corsOptions))
app.use(bodyParser.urlencoded({ extended: true }))

app.get("/", (req , res) => {
  res.send("server");
});

app.listen(3000, () => {
  console.log("server");
});