// experiences model
import mongoose from "mongoose"

const { Schema, model } = mongoose
const experiencesSchema = new Schema(
  {
    role: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    description: { type: String, required: true },
    image: { type: String, required: true }
  },
  { timestamps: true }
)
export default model("Experience", experiencesSchema)
