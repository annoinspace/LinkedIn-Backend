import express from "express"
import usersModel from "./model.js"
import connectionsModel from "../connections/connectionsModel.js"
import createHttpError from "http-errors"
import { pipeline } from "stream"
import { createGzip } from "zlib"
import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { v2 as cloudinary } from "cloudinary"
import getPDFReadableStream from "./pdf-tools.js"

const usersRouter = express.Router()

export const cloudinaryUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "build-week/pfp-images"
    }
  })
}).single("pfp")

// GET

usersRouter.get("/", async (req, res, next) => {
  try {
    const users = await usersModel.find().populate({ path: "posts", select: "category description" })
    res.send(users)
  } catch (error) {
    next(error)
  }
})

// search????
usersRouter.get("/login", async (req, res, next) => {
  try {
    const users = await usersModel.find({
      username: req.query.username,
      password: req.query.password
    })

    res.send(users)
  } catch (error) {
    next(error)
  }
})
//

// GET SPECIFIC

usersRouter.get("/:userId", async (req, res, next) => {
  try {
    const user = await usersModel.findById(req.params.userId)
    if (user) {
      res.send(user)
    } else {
      next(createHttpError(404, `user with id ${req.params.userId} not found`))
    }
  } catch (error) {
    next(error)
  }
})

// PUT

usersRouter.put("/:userId", async (req, res, next) => {
  try {
    const updatedUser = await usersModel.findByIdAndUpdate(req.params.userId, req.body, {
      new: true,
      runValidators: true
    })

    if (updatedUser) {
      res.send(updatedUser)
    } else {
      next(createHttpError(404, `user with id ${req.params.userId} not found`))
    }
  } catch (error) {
    next(error)
  }
})

// DELETE

usersRouter.delete("/:userId", async (req, res, next) => {
  try {
    const deletedUser = await usersModel.findByIdAndDelete(req.params.userId)
    if (deletedUser) {
      res.status(204).send()
    } else {
      next(createHttpError(404, `user with id ${req.params.userId} not found`))
    }
  } catch (error) {
    next(error)
  }
})

//CV (pdf)
// usersRouter.get("/:userId/cv", async (req, res, next) => {
//   res.setHeader("Content-Disposition", `attachment; filename=CV.pdf`);
//   const users = await usersModel.find();
//   const index = users.findIndex((user) => user.id === req.params.userId);
//   if (index !== -1) {
//     const CV = users[index];
//     console.log(CV);
//     const source = await getPDFReadableStream(CV);
//     const destination = res;
//     pipeline(source, destination, (err) => {
//       if (err) console.log(err);
//     });
//   }
// });

usersRouter.get("/:userId/cv", async (req, res, next) => {
  res.setHeader("Content-Disposition", "attachment; filename=cv.pdf")
  try {
    const user = await usersModel.findById(req.params.userId)
    const source = await getPDFReadableStream(user)
    const destination = res
    pipeline(source, destination, (err) => {
      if (err) console.log(err)
    })
  } catch (err) {
    next(err)
  }
})

// POST

usersRouter.post("/", async (req, res, next) => {
  try {
    const duplicate = await usersModel.find({
      username: req.body.username
    })
    console.log(duplicate)
    if (duplicate.length === 0) {
      console.log(duplicate)
      const newUser = new usersModel(req.body)
      const { _id } = await newUser.save()
      if (newUser) {
        const newUserConnectionModel = new connectionsModel(
          { _id: newUser._id },
          { $set: { connections: null } },
          { new: true, runValidators: true }
        )
        newUserConnectionModel.save()
      }
      res.status(201).send({ _id })
    } else {
      console.log(duplicate)
      res.status(202).send("This username already exists!")
    }
  } catch (error) {
    next(error)
  }
})

//PFP post
usersRouter.post("/:userId/pfp", cloudinaryUpload, async (req, res, next) => {
  const updatedUser = await usersModel.findByIdAndUpdate(req.params.userId, {
    ...req.body,
    pfp: req.file.path
  })
  const { _id } = await updatedUser.save()
  res.status(201).send({ _id })
})
//LOGIN
usersRouter.get("/login", async (req, res, next) => {
  try {
    const user = await usersModel.find({
      username: req.query.username,
      password: req.query.password
    })
    if (user.length(0)) {
      res.send("Wrong!")
    } else {
      res.send(user)
    }
  } catch (error) {
    next(error)
  }
})
export default usersRouter
