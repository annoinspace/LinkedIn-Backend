// experiences routes

// – DELETE https://yourapi.herokuapp.com/api/users/{userId}/experiences/{expId}

// Delete a specific experience

// – POST https://yourapi.herokuapp.com/api/profile/:userName/experiences/:expId/picture

// Change the experience picture

// – GET https://yourapi.herokuapp.com/api/profile/:userName/experiences/CSV

// Download the experiences as a CSV

import express from "express"
import ExperiencesModel from "./experiencesModel.js"
import createHttpError from "http-errors"

const experiencesRouter = express.Router()

experiencesRouter.get("/:userId/experiences", async (req, res, next) => {
  try {
    const experience = await ExperiencesModel.findById(req.params.userId)
    if (experience) {
      if (experience.experiences.length === 0) {
        res.send("No experiences found for this experience.")
      } else {
        res.send(experience.experiences)
      }
    } else {
      next(createHttpError(404, `experience with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

experiencesRouter.get("/:userId/experiences/:expId", async (req, res, next) => {
  try {
    const experience = await ExperiencesModel.findById(req.params.userId)
    if (experience) {
      const selectedExperience = experience.experiences.find(
        (experience) => experience._id.toString() === req.params.expId
      )

      if (selectedExperience) {
        res.send(selectedExperience)
      } else {
        next(createHttpError(404, `experience with id ${req.params.expId} not found!`))
      }
    } else {
      next(createHttpError(404, `experience with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

experiencesRouter.post("/:userId/experiences", async (req, res, next) => {
  try {
    const experience = req.body // Get the experience from the req.body

    if (experience) {
      const experienceToInsert = experience
      const updatedExperience = await ExperiencesModel.findByIdAndUpdate(
        req.params.userId, // WHO
        { $push: { experiences: experienceToInsert } }, // HOW
        { new: true, runValidators: true } // OPTIONS
      )

      if (updatedExperience) {
        res.send(updatedExperience)
      } else {
        next(createHttpError(404, `experience with id ${req.params.userId} not found!`))
      }
    } else {
      // 4. In case of either book not found or experience not found --> 404
      next(createHttpError(404, `experience not found!`))
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
