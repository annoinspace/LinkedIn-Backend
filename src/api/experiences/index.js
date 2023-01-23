// – GET https://yourapi.herokuapp.com/api/profile/:userName/experiences/CSV

// Download the experiences as a CSV

import express from "express"
import ExperiencesModel from "./experiencesModel.js"
import UsersModel from "../users/model.js"
import createHttpError from "http-errors"

const experiencesRouter = express.Router()

experiencesRouter.get("/:userId/experiences", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId)
    if (user) {
      if (user.experiences.length === 0) {
        res.send(`User ${user.username} has no experiences`)
      } else {
        res.send(user.experiences)
      }
    } else {
      next(createHttpError(404, `user with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

experiencesRouter.get("/:userId/experiences/:expId", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId)

    if (user) {
      const selectedExperience = user.experiences.find(
        (experience) => experience._id.toString() === req.params.expId // You CANNOT compare a string(req.params.productId) with an ObjectId (product._id) --> you have to either convert _id into string or ProductId into ObjectId
      )
      // console.log(user.experiences)
      if (selectedExperience) {
        res.send(selectedExperience)
      } else {
        next(createHttpError(404, `experience with id ${req.body.expId} not found!`))
      }
    } else {
      next(createHttpError(404, `user with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

experiencesRouter.post("/:userId/experiences", async (req, res, next) => {
  try {
    const experience = req.body

    if (experience) {
      const experienceToInsert = experience
      const updatedExperience = await UsersModel.findByIdAndUpdate(
        req.params.userId, // WHO
        { $push: { experiences: experienceToInsert } }, // HOW
        { new: true, runValidators: true } // OPTIONS
      )

      if (updatedExperience) {
        res.send(updatedExperience)
      } else {
        next(createHttpError(404, `user with id ${req.params.userId} not found!`))
      }
    } else {
      // 4. In case of either book not found or experience not found --> 404
      next(createHttpError(404, `user not found!`))
    }
  } catch (error) {
    next(error)
  }
})

experiencesRouter.put("/:userId/experiences/:expId", async (req, res, next) => {
  try {
    const experience = req.body // Get the experience edit from the req.body

    if (experience) {
      // Find the experience by id and update it with the new experience data
      const updatedExperience = await ExperiencesModel.findOneAndUpdate(
        { "experiences._id": req.params.expId },
        { $set: { "experiences.$": experience } },
        { new: true, runValidators: true } // OPTIONS
      )

      if (updatedExperience) {
        res.send(updatedExperience)
      } else {
        next(createHttpError(404, `experience with id ${req.params.expId} not found!`))
      }
    } else {
      next(createHttpError(404, `experience not found!`))
    }
  } catch (error) {
    next(error)
  }
})

// ----------------------------------------- adding experience image

experiencesRouter.patch("/:userId/experiences/:expId/picture", async (req, res, next) => {
  try {
    const experienceImage = req.file // Get the experience picture from the req.file

    if (experienceImage) {
      // Find the experience by id and update it with the new experience data
      const updatedExperience = await ExperiencesModel.findOneAndUpdate(
        { "experiences._id": req.params.expId },
        { $set: { "experiences.$": experienceImage } },
        { new: true, runValidators: true } // OPTIONS
      )

      if (updatedExperience) {
        res.send(updatedExperience)
      } else {
        next(createHttpError(404, `experience with id ${req.params.expId} not found!`))
      }
    } else {
      next(createHttpError(404, `experience not found!`))
    }
  } catch (error) {
    next(error)
  }
})

experiencesRouter.delete("/:userId/experiences/:expId", async (req, res, next) => {
  try {
    const updatedExperience = await ExperiencesModel.findByIdAndUpdate(
      req.params.userId, // WHO
      { $pull: { experiences: { _id: req.params.expId } } }, // HOW
      { new: true } // OPTIONS
    )
    if (updatedExperience) {
      res.send(updatedExperience)
    } else {
      next(createHttpError(404, `experience with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

export default experiencesRouter
