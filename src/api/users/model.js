import mongoose from "mongoose";
import ExperienceSchema from "../experiences/experiencesModel.js";
const { Schema, model } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  //additional
  pfp: {
    type: String,
    required: false,
    default:
      "https://res.cloudinary.com/dp3i1dce4/image/upload/v1674603395/blank-profile-picture-973460-2_mz4hn1.png",
  },
  bio: { type: String, required: false, default: "" },
  background: { type: String, required: false, default: "" },
  posts: [
    { type: Schema.Types.ObjectId, ref: "Posts", required: false, default: {} },
  ],
  interests: { type: Array, required: false, default: [] },
  job: { type: String, required: false, default: "" },
  education: { type: String, required: false, default: "" },
  location: { type: String, required: false, default: "" },
  experiences: [ExperienceSchema],
});

export default model("Users", userSchema);
