import express from "express";
import fs from "fs";
import upload from "../multer.js";
import ErrorHandler from "../utils/errorHandler.js";
import path from "path";
import User from "../models/User.js";

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

      // console.log(user);
      const newUser = await User.create(user);

      res.status(201).json({
        success: true,
        newUser,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
