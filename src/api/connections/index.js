import express from "express"
import mongoose from "mongoose"
import createHttpError from "http-errors"
import UsersModel from "../users/model.js"
import connectionsModel from "./connectionsModel.js"
const connectionsRouter = express.Router()

connectionsRouter.get("/user/:userId", async (req, res, next) => {
  try {
    const user = await connectionsModel.findById(req.params.userId)
    if (user) {
      console.log("user from get", user)
      if (user) {
        res.send(user)
      } else {
        res.send({ message: `user does not have any connections yet!` })
      }
    }
  } catch (error) {
    next(error)
  }
})

connectionsRouter.post("/user/:userId", async (req, res, next) => {
  try {
    const user = await UsersModel.find({ _id: req.params.userId })

    if (user) {
      const person = req.body.connection
      const personObject = mongoose.Types.ObjectId(person)

      console.log(personObject, "personObject")

      const userConnections = await connectionsModel.findById(req.params.userId)

      if (userConnections) {
        userConnections.connections.push(personObject)

        userConnections.save()

        res.send(userConnections)
        // res.send()
      } else {
        const newConnection = new connectionsModel(
          { _id: mongoose.Types.ObjectId(req.params.userId) },
          { $push: { "user.$.connections": personObject } },
          { new: true }
        )
        const connection = await newConnection.save()

        res.status(201).send(connection)
        // res.status(201).send(personObject)
      }
    }
  } catch (error) {
    next(error)
  }
})

export default connectionsRouter
