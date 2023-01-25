import express from "express";
import createHttpError from "http-errors";
import commentsModel from "./model.js";
import postsModel from "../posts/postsModel.js";
import { cloudinaryUpload } from "../posts/index.js";

const commentsRouter = express.Router();

commentsRouter.get("/:postid", async (req, res, next) => {
  try {
    const comments = await commentsModel.find({
      parentPost: req.params.postid,
    });

    if (comments) {
      res.send(comments);
    } else {
      res.send("No comments on this post.");
    }
  } catch (err) {
    next(err);
  }
});

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

commentsRouter.put("/:commentid", cloudinaryUpload, async (req, res, next) => {
  try {
    if (req.file === undefined) {
      const updatedComment = await commentsModel.findByIdAndUpdate(
        req.params.commentid,
        { ...req.body },
        { new: true, runValidators: true }
      );
      res.send(updatedComment);
    } else {
      const updatedComment = await commentsModel.findByIdAndUpdate(
        req.params.commentid,
        { ...req.body, image: req.file.path },
        { new: true, runValidators: true }
      );
      res.send(updatedComment);
    }
  } catch (err) {
    next(err);
  }
});

commentsRouter.delete("/:commentid", async (req, res, next) => {
  try {
    const selectedComment = await commentsModel.findById(req.params.commentid);
    const postId = selectedComment.parentPost[0];
    const deletedComment = await commentsModel.findByIdAndDelete(
      req.params.commentid
    );
    if (deletedComment) {
      await postsModel.findByIdAndUpdate(postId, {
        $pull: { comments: req.params.commentid },
      });
      res.status(204).send();
    } else {
      next(
        createHttpError(
          404,
          `Comment with id ${req.params.commentid} not found.`
        )
      );
    }
  } catch (err) {
    next(err);
  }
});

export default commentsRouter;
