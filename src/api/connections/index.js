import express from "express"
import mongoose from "mongoose"
import createHttpError from "http-errors"
import UsersModel from "../users/model.js"
import connectionsModel from "./connectionsModel.js"
const connectionsRouter = express.Router()

// check if you have any requests
// connectionsRouter.get("/requests/:userId", async (req, res, next) => {
//   try {
//     const user = await connectionsModel.findById(req.params.userId).populate({
//       path: "requests",
//       select: "name surname"
//     })
//     if (user) {
//       if (user.requests.length > 0) {
//         res.send(user.requests)
//       } else {
//         res.send({ message: `user does not have any connection requests yet!` })
//       }
//     } else {
//       res.send({ message: `you have no pending connection requests!` })
//     }
//   } catch (error) {
//     next(error)
//   }
// })

// check if you have sent pending requests
// connectionsRouter.get("/pending/:userId", async (req, res, next) => {
//   try {
//     const user = await connectionsModel.findById(req.params.userId).populate({
//       path: "pending",
//       select: "name surname"
//     })
//     if (user) {
//       if (user.pending.length > 0) {
//         pending
//       } else {
//         res.send({ message: `user does not have any pending requests!` })
//       }
//     } else {
//       res.send({ message: `user is not waiting for anyone to accept their connection request!` })
//     }
//   } catch (error) {
//     next(error)
//   }
// })

// send a connection request
// connectionsRouter.post("/pending/:userId", async (req, res, next) => {
//   try {
//     const user = await connectionsModel.findById(req.params.userId).populate({
//       path: "pending",
//       select: "name surname"
//     })
//     const requestedUser = await connectionsModel.findById(req.body.connection).populate({
//       path: "pending",
//       select: "name surname"
//     })
//     const userRequest = req.body.connection

//     console.log("user-------", user)
//     console.log("user Request -------", userRequest)

//     if (user) {
//       user.pending.push(userRequest)
//       user.save()
//       res.send(user)
//     } else {
//       const newUser = new connectionsModel(
//         { _id: mongoose.Types.ObjectId(req.params.userId) },
//         { $push: { connections: userRequest } },
//         { new: true, runValidators: true }
//       )
//       const user = await newUser.save()
//       console.log("user-------", user)

//       res.status(201).send(user)
//     }
//   } catch (error) {
//     next(error)
//   }
// })

connectionsRouter.get("/:userId", async (req, res, next) => {
  try {
    const user = await connectionsModel
      .findById(req.params.userId)
      .populate({
        path: "connections",
        select: "name surname"
      })
      .populate({
        path: "pending",
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
      // const personObject = mongoose.Types.ObjectId(person)
      console.log(person, "person")
      const userConnections = await connectionsModel.findById(req.params.userId).populate({
        path: "connections",
        select: "name surname"
      })

      if (userConnections) {
        userConnections.connections.push(person)

        userConnections.save()

        res.status(201).send({ message: `user added to your connections` })
        // res.send()
      } else {
        const newConnection = new connectionsModel(
          { _id: mongoose.Types.ObjectId(req.params.userId) },
          { $push: { connections: person } },
          { new: true, runValidators: true }
        )
        const connection = await newConnection.save()
        console.log(connection, "updated connection")
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

    const userConnectionsUpdate = await connectionsModel
      .findByIdAndUpdate(req.params.userId, { $pull: { connections: { _id: req.params.connectionId } } }, { new: true })
      .populate({
        path: "connections",
        select: "name surname"
      })
    console.log("connections update", userConnectionsUpdate)
    if (userConnectionsUpdate) {
      res.send(userConnectionsUpdate)
    } else {
      next(createHttpError(404, `could not remove connection ${req.params.connectionId} `))
    }
  } catch (error) {
    next(error)
  }
})

export default connectionsRouter
