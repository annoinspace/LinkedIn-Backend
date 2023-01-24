import express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import {
  badRequestHandler,
  notFoundHandler,
  genericErrorHandler,
} from "./errorHandlers.js";

import usersRouter from "./api/users/index.js";
import mongoose from "mongoose";
import experiencesRouter from "./api/experiences/index.js";
import postsRouter from "./api/posts/index.js";
import commentsRouter from "./api/comments/index.js";

const server = express();
const port = process.env.PORT || 3001;
const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];
// ---------------- WHITELIST FOR CORS ------------------
const corsOptions = {
  origin: (origin, corsNext) => {
    console.log("CURRENT ORIGIN: ", origin);
    if (!origin || whitelist.indexOf(origin) !== -1) {
      corsNext(null, true);
    } else {
      corsNext(
        createHttpError(400, `Origin ${origin} is not in the whitelist!`)
      );
    }
  },
};
server.use(cors());
server.use(express.json());

server.use("/posts", postsRouter);
server.use("/users", usersRouter);
server.use("/users", experiencesRouter);
server.use("/comments", commentsRouter)

server.use(badRequestHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);

mongoose.connect(process.env.MONGO_URL);

// -------------------- use mongoose server after connecting to mongo

// mongoose.set("strictQuery", false);

mongoose.connection.on("connected", () => {
  console.log("connected to mongo!");
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log("server is running on port:", port);
  });
});
