// posts routes
import express from "express";
import createHttpError from "http-errors";
import postsModel from "./postsModel.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

const postsRouter = express.Router();

export const cloudinaryUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "build-week/post-imgs",
    },
  }),
}).single("post");

postsRouter.get("/", async (req, res, next) => {
  try {
    const posts = await postsModel
      .find()
      .populate({
        path: "user",
        select: "name surname username _id title pfp",
      })
      .populate({
        path: "comments",
      });
    if (posts.length > 0) {
      res.send(posts);
    } else {
      res.send("There are no posts.");
    }
  } catch (err) {
    next(err);
  }
});

postsRouter.get("/:postid", async (req, res, next) => {
  try {
    const post = await postsModel.findById(req.params.postid).populate({
      path: "user",
      select: "name surname username _id",
    });
    if (post) {
      res.send(post);
    } else {
      next(
        createHttpError(404, `Post with ID ${req.params.postid} not found.`)
      );
    }
  } catch (err) {
    next(err);
  }
});

postsRouter.get("/user/:userid", async (req, res, next) => {
  try {
    const posts = await postsModel.find({ user: req.params.userid });
    if (posts) {
      res.send(posts);
    }
  } catch (err) {
    next(err);
  }
});

postsRouter.post("/:userid", cloudinaryUpload, async (req, res, next) => {
  try {
    if (req.file === undefined) {
      const newPost = new postsModel({
        ...req.body,
        user: req.params.userid,
        image: "http://picsum.photos/800/800",
      });
      const { _id } = await newPost.save();
      res.status(201).send({ _id });
    } else {
      const newPost = new postsModel({
        ...req.body,
        image: req.file.path,
        user: req.params.userid,
      });
      const { _id } = await newPost.save();
      res.status(201).send({ _id });
    }
  } catch (err) {
    next(err);
  }
});

postsRouter.put("/:postid", cloudinaryUpload, async (req, res, next) => {
  try {
    if (req.file === undefined) {
      const updatedPost = await postsModel.findByIdAndUpdate(
        req.params.postid,
        req.body,
        { new: true, runValidators: true }
      );
      if (updatedPost) {
        res.send(updatedPost);
      }
    } else {
      const updatedPost = await postsModel.findByIdAndUpdate(
        req.params.postid,
        { ...req.body, image: req.file.path },
        { new: true, runValidators: true }
      );
      if (updatedPost) {
        res.send(updatedPost);
      }
    }
  } catch (err) {
    next(err);
  }
});

postsRouter.delete("/:postid", async (req, res, next) => {
  try {
    const deletedPost = await postsModel.findByIdAndDelete(req.params.postid);
    if (deletedPost) {
      res.status(204).send();
    } else {
      next(
        createHttpError(
          404,
          `Post with ID ${req.params.postid} not found, cannot delete.`
        )
      );
    }
  } catch (err) {
    next(err);
  }
});

export default postsRouter;
