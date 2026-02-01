import mongoose from "mongoose";

const workLocationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export const WorkLocation = mongoose.model("WorkLocation", workLocationSchema);
