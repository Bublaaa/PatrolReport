import mongoose from "mongoose";

const patrolPointSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    barcode: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const PatrolPoint = mongoose.model("PatrolPoint", patrolPointSchema);
