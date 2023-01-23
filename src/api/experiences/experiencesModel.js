// experiences model
import mongoose from "mongoose"

const { Schema } = mongoose
const experiencesSchema = new Schema(
  {
    // user: [{ type: Schema.Types.ObjectId, ref: "Users" }],
    role: { type: String, required: true },
    company: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    description: { type: String, required: true },
    image: { type: String }
  },
  { timestamps: true }
)
export default experiencesSchema
