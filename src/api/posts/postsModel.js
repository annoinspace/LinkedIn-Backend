// posts model
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const postSchema = new Schema(
  {
    text: { type: String, required: true },
    username: { type: String, required: true },
    user: [{ type: Schema.Types.ObjectId, ref: "Users" }],
    name: { type: String, required: true },
    surname: { type: String, required: true },
    image: { type: String, required: false },
  },
  { timestamps: true }
);

export default model("Posts", postSchema);
