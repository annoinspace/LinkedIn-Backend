// posts routes
import express from "express";
import createHttpError from "http-errors";
import postsModel from "./postsModel.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

const postsRouter = express.Router();

const cloudinaryUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "build-week/post-imgs",
    },
  }),
}).single("post");

postsRouter.get("/", async (req, res, next) => {
  try {
    const posts = await postsModel.find()
    if (posts.length > 0) {
      res.send(posts);
    } else {
      res.send("There are no posts.");
    }
  } catch (err) {
    next(err);
  }
});

postsRouter.post("/", cloudinaryUpload, async (req, res, next) => {
  try {
    if (req.file === undefined) {
      const newPost = new postsModel({
        ...req.body,
        image: "http://picsum.photos/800/800",
      });
      const { _id } = await newPost.save();
      res.status(201).send({ _id });
    } else {
      const newPost = new postsModel({
        ...req.body,
        image: req.file.path,
      });
      const { _id } = await newPost.save();
      res.status(201).send({ _id });
    }
  } catch (err) {
    next(err);
  }
});

export default postsRouter;
