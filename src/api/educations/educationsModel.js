// educations model
import mongoose from "mongoose";

const { Schema } = mongoose;
const educationsSchema = new Schema({
  company: { type: String, required: true },
  description: { type: String, required: true },
  areaOfStudies: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  image: { type: String },
});
export default educationsSchema;
