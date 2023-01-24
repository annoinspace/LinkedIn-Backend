import express from "express";
import usersModel from "./model.js";
import createHttpError from "http-errors";
import { pipeline } from "stream";
import { createGzip } from "zlib";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
const usersRouter = express.Router();

export const cloudinaryUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "build-week/pfp-images",
    },
  }),
}).single("user");

// GET

usersRouter.get("/", async (req, res, next) => {
  try {
    const users = await usersModel
      .find()
      .populate({ path: "posts", select: "category description" });
    res.send(users);
  } catch (error) {
    next(error);
  }
});

// search????
usersRouter.get("/login", async (req, res, next) => {
  try {
    const users = await usersModel.find({
      username: req.query.username,
      password: req.query.password,
    });

    res.send(users);
  } catch (error) {
    next(error);
  }
});
//

// GET SPECIFIC

usersRouter.get("/:userId", async (req, res, next) => {
  try {
    const user = await usersModel.findById(req.params.userId);
    if (user) {
      res.send(user);
    } else {
      next(createHttpError(404, `user with id ${req.params.userId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

// PUT

usersRouter.put("/:userId", async (req, res, next) => {
  try {
    const updatedUser = await usersModel.findByIdAndUpdate(
      req.params.userId,
      req.body,
      { new: true, runValidators: true }
    );

    if (updatedUser) {
      res.send(updatedUser);
    } else {
      next(createHttpError(404, `user with id ${req.params.userId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

// DELETE

usersRouter.delete("/:userId", async (req, res, next) => {
  try {
    const deletedUser = await usersModel.findByIdAndDelete(req.params.userId);
    if (deletedUser) {
      res.status(204).send();
    } else {
      next(createHttpError(404, `user with id ${req.params.userId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

//CV (pdf)
// usersRouter.get("/:userId/cv", async (req, res, next) => {
//   res.setHeader("Content-Disposition", `attachment; filename=CV.pdf`);
//   const users = await usersModel.find();
//   const index = users.findIndex((user) => user.id === req.params.userId);
//   if (index !== -1) {
//     const CV = users[index];
//     console.log(CV);
//     const source = await getPDFReadableStream(CV);
//     const destination = res;
//     pipeline(source, destination, (err) => {
//       if (err) console.log(err);
//     });
//   }
// });

// POST

usersRouter.post("/", async (req, res, next) => {
  try {
    const newUser = new usersModel(req.body);
    const { _id } = await newUser.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

//
usersRouter.post("/:userId/pfp", cloudinaryUpload, async (req, res, next) => {
  const updatedUser = await usersModel.findByIdAndUpdate(req.params.userId, {
    ...req.body,
    pfp: req.file.path,
  });
  const { _id } = await updatedUser.save();
  res.status(201).send({ _id });
});

export default usersRouter;
