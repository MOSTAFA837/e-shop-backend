import express from "express";
import fs from "fs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import upload from "../multer.js";
import ErrorHandler from "../utils/errorHandler.js";
import path from "path";
import { sendMail } from "../utils/sendMail.js";

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
