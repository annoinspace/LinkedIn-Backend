import express from "express";
import usersModel from "./model.js";
import createHttpError from "http-errors";
const usersRouter = express.Router();

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

export default usersRouter;
