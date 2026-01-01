import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patrolPointId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PatrolPoint",
      required: true,
    },
    report: {
      type: String,
      required: true,
    },
    documentUrl: {
      type: String,
    },
    documentFileId: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Report = mongoose.model("Report", reportSchema);
