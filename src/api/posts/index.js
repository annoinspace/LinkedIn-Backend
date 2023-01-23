import express from "express";
import postModel from "./model.js";
import createHttpError from "http-errors";
import q2m from "query-to-mongo";
const postsRouter = express.Router();

// POST

postsRouter.post("/", async (req, res, next) => {
  try {
    const newPost = new postModel(req.body);
    const { _id } = await newPost.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

// GET

postsRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    const total = await postModel.countDocuments(mongoQuery.criteria);
    console.log(total);
    const posts = await postModel
      .find(mongoQuery.criteria, mongoQuery.options.fields)
      .populate({ path: "user", select: "name surname username pfp" })
      .sort(mongoQuery.options.sort)
      .skip(mongoQuery.options.skip)
      .limit(mongoQuery.options.limit);
    res.status(200).send({
      links: mongoQuery.links(total),
      total,
      totalPages: Math.ceil(total / mongoQuery.options.limit),
      posts,
    });
    // const posts = await postModel
    //   .find({})
    //   .populate({ path: "review", select: "comment rate" });
    // res.send(posts);
  } catch (error) {
    next(error);
  }
});

// GET SPECIFIC

postsRouter.get("/:postId", async (req, res, next) => {
  try {
    const post = await postModel
      .findById(req.params.postId)
      .populate({ path: "user", select: "name surname username pfp" });

    if (post) {
      res.send(post);
    } else {
      next(createHttpError(404, `post with id ${req.params.postId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

// PUT

postsRouter.put("/:postId", async (req, res, next) => {
  try {
    const updatedpost = await postModel.findByIdAndUpdate(
      req.params.postId,
      req.body,
      { new: true, runValidators: true }
    );

    if (updatedpost) {
      res.send(updatedpost);
    } else {
      next(createHttpError(404, `post with id ${req.params.postId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

// DELETE

postsRouter.delete("/:postId", async (req, res, next) => {
  try {
    const deletedpost = await postModel.findByIdAndDelete(req.params.postId);
    if (deletedpost) {
      res.status(204).send();
    } else {
      next(createHttpError(404, `post with id ${req.params.postId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

export default postsRouter;
