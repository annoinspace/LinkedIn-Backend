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
      select: "name surname pfp"
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
      const personToConnectWith = req.body.connection

      const myUser = await connectionsModel.findById(req.params.userId).populate({
        path: "connections",
        select: "name surname pfp"
      })

      // checking if the user already exists

      if (myUser) {
        const index = myUser.connections.findIndex((connection) => connection._id.toString() === personToConnectWith)
        if (index !== -1) {
          console.log("user connection exists")
          res.send({ message: `connection already exists` })
        } else {
          myUser.connections.push(personToConnectWith)
          myUser.save()
          // check if the user I want to connect with has a connectionmodel, if not then create it
          const checkingForTheOtherUser = await connectionsModel.findById(personToConnectWith).populate({
            path: "connections",
            select: "name surname pfp"
          })
          if (!checkingForTheOtherUser) {
            console.log("-----------------------------------------User exists, creating other user")
            const newConnectionOtherUser = new connectionsModel(
              { _id: mongoose.Types.ObjectId(personToConnectWith) },
              { $set: { connections: req.params.userId } },
              { new: true, runValidators: true }
            )
            newConnectionOtherUser.save()
          } else {
            checkingForTheOtherUser.connections.push(req.params.userId)
            checkingForTheOtherUser.save()
          }

          res.status(201).send({ message: `user added to your connections` })
        }
      }
      if (!myUser) {
        console.log("-----------------------------------------User does not exist")
        const newConnection = new connectionsModel(
          { _id: mongoose.Types.ObjectId(req.params.userId) },
          { $set: { connections: personToConnectWith } },
          { new: true, runValidators: true }
        )
        const connection = await newConnection.save()

        // check if the user I want to connect with has a connectionmodel, if not then create it
        const checkingForTheOtherUser = await connectionsModel.findById(personToConnectWith).populate({
          path: "connections",
          select: "name surname pfp"
        })

        if (!checkingForTheOtherUser) {
          console.log("-----------------------------------------Other User does not exist, creating it now")
          const newConnectionOtherUser = new connectionsModel(
            { _id: mongoose.Types.ObjectId(personToConnectWith) },
            { $set: { connections: req.params.userId } },
            { new: true, runValidators: true }
          )
          newConnectionOtherUser.save()
        } else {
          checkingForTheOtherUser.connections.push(req.params.userId)
          checkingForTheOtherUser.save()
          console.log(connection, "updated connection")
        }
        res.status(201).send({ message: `user added to your connections` })
      }

      console.log("users connection checks finished")
    } else {
      res.send({ message: `something went terribly wrong :(` })
    }
  } catch (error) {
    next(error)
  }
})

connectionsRouter.delete("/:userId/:connectionId", async (req, res, next) => {
  try {
    const connectionId = mongoose.Types.ObjectId(req.params.connectionId)
    console.log("------------------------------------connection", connectionId)
    const userId = mongoose.Types.ObjectId(req.params.userId)
    console.log("------------------------------------my userId", userId)

    const myUserConnectionDeleted = await connectionsModel.findOneAndUpdate(
      { user: userId },
      { $pull: { connections: { _id: connectionId } } },
      { new: true }
    )

    if (myUserConnectionDeleted) {
      res.status(200).json({ message: "Connection successfully deleted." })
    } else {
      next(createHttpError(404, `Could not remove connection ${req.params.connectionId}`))
    }
  } catch (error) {
    next(error)
  }
})

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

export default connectionsRouter
