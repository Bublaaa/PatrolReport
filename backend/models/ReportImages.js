import mongoose from "mongoose";

const reportImagesSchema = new mongoose.Schema(
  {
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const ReportImages = mongoose.model("ReportImages", reportImagesSchema);
