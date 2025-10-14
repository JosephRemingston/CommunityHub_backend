import serverlessExpress  from "@vendia/serverless-express";
import app from "./index.js";

export var handler = serverlessExpress({app});