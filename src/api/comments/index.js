import express from "express";
import createHttpError from "http-errors";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import commentsModel from "./model.js";
import postsModel from "../posts/postsModel.js";
import { cloudinaryUpload } from "../posts/index.js";

const commentsRouter = express.Router();

commentsRouter.post("/:postid", cloudinaryUpload, async (req, res, next) => {
  try {
    if (req.file === undefined) {
      const newComment = new commentsModel({
        ...req.body,
        parentPost: req.params.postid,
      });
      const { _id } = await newComment.save();
      await postsModel.findByIdAndUpdate(
        req.params.postid,
        { $push: { comments: _id } },
        { new: true }
      );
      res.status(201).send({ _id });
    } else {
      const newComment = new commentsModel({
        ...req.body,
        parentPost: req.params.postid,
        image: req.file.path,
      });
      const { _id } = await newComment.save();
      await postsModel.findByIdAndUpdate(
        req.params.postid,
        { $push: { comments: _id } },
        { new: true }
      );
      res.status(201).send({ _id });
    }
  } catch (err) {
    next(err);
  }
});

export default commentsRouter;
