import express from "express"
import mongoose from "mongoose"
import createHttpError from "http-errors"
import UsersModel from "../users/model.js"
import connectionsModel from "./connectionsModel.js"
const connectionsRouter = express.Router()

connectionsRouter.get("/:userId", async (req, res, next) => {
  try {
    const user = await connectionsModel.findById(req.params.userId).populate({
      path: "connections",
      select: "name surname"
    })
    if (user) {
      console.log("user from get", user)
      if (user) {
        res.send(user)
      } else {
        res.send({ message: `user does not have any connections yet!` })
      }
    } else {
      res.send({ message: `come back once you've added some connections!` })
    }
  } catch (error) {
    next(error)
  }
})

connectionsRouter.post("/:userId", async (req, res, next) => {
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
          { $push: { connections: personObject } },
          { new: true, runValidators: true }
        )
        const connection = await newConnection.save()
        console.log(updatedConnection, "updated connection")
        res.status(201).send(connection)
      }
    }
  } catch (error) {
    next(error)
  }
})

connectionsRouter.delete("/:userId/:connectionId", async (req, res, next) => {
  try {
    console.log("userId", req.params.userId)
    console.log("connectionId", req.params.connectionId)
    // const connectionIdObject = mongoose.Types.ObjectId(req.params.connectionId)
    // console.log("connectionIdObject", connectionIdObject)
    const userConnectionsUpdate = await connectionsModel.findByIdAndUpdate(
      req.params.userId, // WHO
      { $pull: { connections: { _id: req.params.connectionId } } }, // HOW
      { new: true } // OPTIONS
    )
    console.log("connections update", userConnectionsUpdate.connections.toString())
    if (userConnectionsUpdate) {
      res.send(userConnectionsUpdate)
    } else {
      next(createHttpError(404, `could not remove connection ${req.params.connectionId} `))
    }
  } catch (error) {
    next(error)
  }
  // try {
  //   const user = await UsersModel.find({ _id: req.params.userId })

  //   if (user) {
  //     const person = req.body.connection
  //     const personObject = mongoose.Types.ObjectId(person)

  //     console.log(personObject, "personObject")

  //     const userConnections = await connectionsModel.findById(req.params.userId)

  //     if (userConnections) {
  //       userConnections.connections.push(personObject)

  //       userConnections.save()

  //       res.send(userConnections)
  //       // res.send()
  //     } else {
  //       const newConnection = new connectionsModel(
  //         { _id: mongoose.Types.ObjectId(req.params.userId) },
  //         { $push: { connections: personObject } },
  //         { new: true, runValidators: true }
  //       )
  //       const connection = await newConnection.save()
  //       console.log(updatedConnection, "updated connection")
  //       res.status(201).send(connection)
  //     }
  //   }
  // } catch (error) {
  //   next(error)
  // }
})

export default connectionsRouter
