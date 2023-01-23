import express from "express";
import experienceModel from "./model.js";
import createHttpError from "http-errors";
import q2m from "query-to-mongo";
const experiencesRouter = express.Router();

// experience

experiencesRouter.experience("/", async (req, res, next) => {
  try {
    const newExperience = new experienceModel(req.body);
    const { _id } = await newExperience.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

// GET

experiencesRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    const total = await experienceModel.countDocuments(mongoQuery.criteria);
    console.log(total);
    const experiences = await experienceModel
      .find(mongoQuery.criteria, mongoQuery.options.fields)
      .sort(mongoQuery.options.sort)
      .skip(mongoQuery.options.skip)
      .limit(mongoQuery.options.limit);
    res.status(200).send({
      links: mongoQuery.links(total),
      total,
      totalPages: Math.ceil(total / mongoQuery.options.limit),
      experiences,
    });
  } catch (error) {
    next(error);
  }
});

// GET SPECIFIC

experiencesRouter.get("/:experienceId", async (req, res, next) => {
  try {
    const experience = await experienceModel.findById(req.params.experienceId);

    if (experience) {
      res.send(experience);
    } else {
      next(
        createHttpError(
          404,
          `experience with id ${req.params.experienceId} not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

// PUT

experiencesRouter.put("/:experienceId", async (req, res, next) => {
  try {
    const updatedexperience = await experienceModel.findByIdAndUpdate(
      req.params.experienceId,
      req.body,
      { new: true, runValidators: true }
    );

    if (updatedexperience) {
      res.send(updatedexperience);
    } else {
      next(
        createHttpError(
          404,
          `experience with id ${req.params.experienceId} not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

// DELETE

experiencesRouter.delete("/:experienceId", async (req, res, next) => {
  try {
    const deletedexperience = await experienceModel.findByIdAndDelete(
      req.params.experienceId
    );
    if (deletedexperience) {
      res.status(204).send();
    } else {
      next(
        createHttpError(
          404,
          `experience with id ${req.params.experienceId} not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

export default experiencesRouter;
