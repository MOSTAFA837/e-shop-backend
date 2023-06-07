import express from "express";
import fs from "fs";
import jwt from "jsonwebtoken";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";

import User from "../models/User.js";
import upload from "../multer.js";
import ErrorHandler from "../utils/errorHandler.js";
import path from "path";
import { sendMail } from "../utils/sendMail.js";
import Errorhandler from "../utils/errorHandler.js";
import { sendToken } from "../utils/sendToten.js";

const router = express.Router();

export const signup = router.post(
  "/create-user",
  upload.single("file"),
  async (req, res, next) => {
    try {
      const { name, email, password } = req.body;

      const isUserExist = await User.findOne({ email });
      if (isUserExist) {
        const filename = req.file.filename;
        const filePath = `uploads/${filename}`;

        fs.unlink(filePath, (err) => {
          if (err) {
            console.log(err);
            res
              .status(500)
              .json({ message: "Error deleting existing user file" });
          }
        });

        return next(new ErrorHandler("User already exists", 400));
      }

      const filename = req.file.filename;
      const fileUrl = path.join(filename);

      const user = {
        name: name,
        email: email,
        password: password,
        avatar: fileUrl,
      };

      const activationToken = createActivationToken(user);
      const activationUrl = `${process.env.CLIENT_URL}/activation/${activationToken}`;

      try {
        await sendMail({
          email: user.email,
          subject: "Activte your account",
          message: `Hello ${user.name}, please click on the link to activate your account: ${activationUrl}`,
        });

        res.status(201).json({
          success: true,
          message: `Please check your email address: ${user.email} to activate your account`,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

const createActivationToken = (user) => {
  return jwt.sign(user, `${process.env.ACTIVATION_SECRET}`, {
    expiresIn: "5m",
  });
};

export const activateSignup = router.post(
  "/activation",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { activation_token } = req.body;

      const newUser = jwt.verify(
        activation_token,
        `${process.env.ACTIVATION_TOKEN}`
      );

      if (!newUser) {
        return next(new Errorhandler("Invalid token", 400));
      }

      const { name, email, password, avatar } = newUser;

      let user = await User.findOne({ email });
      if (user) {
        return next(new ErrorHandler("User already exists", 400));
      }

      user = await User.create({ name, email, password, avatar });

      sendToken(user, 201, res);
    } catch (error) {
      return next(new Errorhandler(error.message, 500));
    }
  })
);
