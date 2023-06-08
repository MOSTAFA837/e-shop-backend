import express from "express";
import dotenv from "dotenv";
import Errorhandler from "./utils/errorHandler.js";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";

import { activateSignup, loadUser, login, signup } from "./controller/user.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    optionSuccessStatus: 200,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", express.static("uploads"));

// config
if (process.env.NODE_ENV !== "PRODUCTION") {
  dotenv.config();
}

app.use("/api/user", signup);
app.use("/api/user", activateSignup);
app.use("/api/user", login);
app.use("/api/user", loadUser);

// error hanler middleware
app.use(Errorhandler);

export default app;
