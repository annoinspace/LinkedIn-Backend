import mongoose from "mongoose"
const { Schema, model } = mongoose

const connectionsSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "Users" },
  connections: [{ type: Schema.Types.ObjectId, ref: "Users" }],
  requests: [{ type: Schema.Types.ObjectId, ref: "Users" }]
})

export default model("Connection", connectionsSchema)
