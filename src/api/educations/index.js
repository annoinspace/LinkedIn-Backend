import express from "express";
import UsersModel from "../users/model.js";
import createHttpError from "http-errors";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import json2csv from "json2csv";
import { Parser } from "@json2csv/plainjs";
import { pipeline } from "stream";

const educationsRouter = express.Router();

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "build-week/education-imgs",
    },
  }),
}).single("image");

educationsRouter.get("/:userId/educations", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId);
    if (user) {
      if (user.educations.length === 0) {
        res.send(`User ${user.username} has no educations`);
      } else {
        res.send(user.educations);
      }
    } else {
      next(
        createHttpError(404, `user with id ${req.params.userId} not found!`)
      );
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

educationsRouter.get("/:userId/educations/csv", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId);
    if (user) {
      const myData = user.educations;
      const opts = {
        fields: ["role", "company", "startDate"],
      };
      const parser = new Parser(opts);
      const csv = parser.parse(myData);
      console.log(csv);
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=educations.csv"
      );
      // const destination = res
      // pipeline(user, parser, destination, (err) => {
      //   if (err) console.log(err)
      // })
      res.send(csv);
    } else {
      res.send({ message: "user not found" });
    }
  } catch (err) {
    console.error(err);
  }
});

educationsRouter.get("/:userId/educations/:expId", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId);

    if (user) {
      const selectededucation = user.educations.find(
        (education) => education._id.toString() === req.params.expId // You CANNOT compare a string(req.params.productId) with an ObjectId (product._id) --> you have to either convert _id into string or ProductId into ObjectId
      );
      // console.log(user.educations)
      if (selectededucation) {
        res.send(selectededucation);
      } else {
        next(
          createHttpError(404, `education with id ${req.body.expId} not found!`)
        );
      }
    } else {
      next(
        createHttpError(404, `user with id ${req.params.userId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

educationsRouter.post(
  "/:userId/educations/:expId/picture",
  cloudinaryUploader,
  async (req, res, next) => {
    try {
      const educationImage = req.file.path;
      const user = await UsersModel.findById(req.params.userId);
      if (user) {
        // Find the education by id and update it with the new education image
        const index = user.educations.findIndex(
          (education) => education._id.toString() === req.params.expId
        );

        if (index !== -1) {
          console.log({ ...user.educations[index] });
          user.educations[index] = {
            ...user.educations[index].toObject(),
            image: educationImage,
          };
          await user.save();
          res.send(user);
        } else {
          next(
            createHttpError(
              404,
              `education with id ${req.params.expId} not found!`
            )
          );
        }
      } else {
        next(createHttpError(404, `education not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

educationsRouter.post("/:userId/educations", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId);
    if (user) {
      const educationToInsert = {
        ...req.body,
        createdAt: new Date(),
        image: "",
      };
      console.log("education TO Insert: ", educationToInsert);

      const updatedUser = await UsersModel.findByIdAndUpdate(
        req.params.userId, // WHO
        { $push: { educations: educationToInsert } }, // HOW
        { new: true, runValidators: true } // OPTIONS
      );
      if (updatedUser) {
        res.send(updatedUser);
      } else {
        next(
          createHttpError(404, `User with id ${req.params.userId} not found!`)
        );
      }
    } else {
      next(
        createHttpError(
          404,
          `User with id ${req.params.userId} not found in request!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

educationsRouter.put("/:userId/educations/:expId", async (req, res, next) => {
  try {
    const update = req.body;
    const user = await UsersModel.findById(req.params.userId);

    if (user) {
      console.log("user found");
      const index = user.educations.findIndex(
        (education) => education._id.toString() === req.params.expId
      );
      if (index !== -1) {
        user.educations[index] = {
          ...user.educations[index].toObject(),
          ...update,
          updatedAt: new Date(),
        };

        await user.save();
        res.send(user);
      }
    } else {
      next(createHttpError(404, `education ${req.params.expId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

educationsRouter.delete(
  "/:userId/educations/:expId",
  async (req, res, next) => {
    try {
      const updatededucation = await UsersModel.findByIdAndUpdate(
        req.params.userId, // WHO
        { $pull: { educations: { _id: req.params.expId } } }, // HOW
        { new: true } // OPTIONS
      );
      if (updatededucation) {
        res.send(updatededucation);
      } else {
        next(
          createHttpError(
            404,
            `education with id ${req.params.userId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default educationsRouter;
