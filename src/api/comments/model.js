import mongoose from "mongoose";

const { Schema, model } = mongoose;

const commentSchema = new Schema(
  {
    text: { type: String, required: true },
    author: [{ type: Schema.Types.ObjectId, ref: "Users", required: true }],
    parentPost: [{ type: Schema.Types.ObjectId, ref: "Posts", required: true }],
    image: { type: String, required: false },
  },
  { timestamps: true }
);

export default model("Comments", commentSchema);
