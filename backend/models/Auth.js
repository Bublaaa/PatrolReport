import mongoose from "mongoose";

const authSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    workLocationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkLocation",
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    middleName: {
      type: String,
    },
    lastName: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export const Auth = mongoose.model("Auth", authSchema);
