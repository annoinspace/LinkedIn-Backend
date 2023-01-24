import express from "express"
import UsersModel from "../users/model.js"
import createHttpError from "http-errors"
import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { v2 as cloudinary } from "cloudinary"
import json2csv from "json2csv"
import { pipeline } from "stream"

const experiencesRouter = express.Router()

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "build-week/experience-imgs"
    }
  })
}).single("image")

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
experiencesRouter.get("/:userId/experiences/csv", async (req, res, next) => {
  try {
    const source = await UsersModel.findById(req.params.userId)
    if (source) {
      if (source.experiences.length === 0) {
        res.send(`User ${source.username} has no experiences`)
      } else {
        res.setHeader("Content-Disposition", "attachment; filename=experiences.csv")
        const transform = new json2csv.Transform({ fields: ["_id", "role", "company"] })
        const destination = res
        pipeline(source, transform, destination, (err) => {
          if (err) console.log(err)
        })
        res.send()
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

experiencesRouter.post("/:userId/experiences/:expId/picture", cloudinaryUploader, async (req, res, next) => {
  try {
    const experienceImage = req.file.path
    const user = await UsersModel.findById(req.params.userId)
    if (user) {
      // Find the experience by id and update it with the new experience image
      const index = user.experiences.findIndex((experience) => experience._id.toString() === req.params.expId)

      if (index !== -1) {
        console.log({ ...user.experiences[index] })
        user.experiences[index] = {
          ...user.experiences[index].toObject(),
          image: experienceImage
        }
        await user.save()
        res.send(user)
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

experiencesRouter.post("/:userId/experiences", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId)
    if (user) {
      const experienceToInsert = {
        ...req.body,
        createdAt: new Date(),
        image: ""
      }
      console.log("Experience TO Insert: ", experienceToInsert)

      const updatedUser = await UsersModel.findByIdAndUpdate(
        req.params.userId, // WHO
        { $push: { experiences: experienceToInsert } }, // HOW
        { new: true, runValidators: true } // OPTIONS
      )
      if (updatedUser) {
        res.send(updatedUser)
      } else {
        next(createHttpError(404, `User with id ${req.params.userId} not found!`))
      }
    } else {
      next(createHttpError(404, `User with id ${req.params.userId} not found in request!`))
    }
  } catch (error) {
    next(error)
  }
})

experiencesRouter.put("/:userId/experiences/:expId", async (req, res, next) => {
  try {
    const update = req.body
    const user = await UsersModel.findById(req.params.userId)

    if (user) {
      console.log("user found")
      const index = user.experiences.findIndex((experience) => experience._id.toString() === req.params.expId)
      if (index !== -1) {
        user.experiences[index] = {
          ...user.experiences[index].toObject(),
          ...update,
          updatedAt: new Date()
        }

        await user.save()
        res.send(user)
      }
    } else {
      next(createHttpError(404, `experience ${req.params.expId} not found`))
    }
  } catch (error) {
    next(error)
  }
})

experiencesRouter.delete("/:userId/experiences/:expId", async (req, res, next) => {
  try {
    const updatedExperience = await UsersModel.findByIdAndUpdate(
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
