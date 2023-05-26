import express from "express";
import dotenv from "dotenv";
import Errorhandler from "./utils/errorHandler.js";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload({ useTempFiles: true }));

// config
if (process.env.NODE_ENV !== "PRODUCTION") {
  dotenv.config();
}

// error hanler middleware
app.use(Errorhandler);

export default app;
