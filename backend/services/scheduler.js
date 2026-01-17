import cron from "node-cron";
import fs from "fs";
import sharp from "sharp";
import { Report } from "../models/Report.js";
import { ReportImages } from "../models/ReportImages.js";
import { generateUploadPDF } from "../utils/report.pdf.generator.js";
import { uploadToDrive } from "../controllers/drive.upload.controller.js";

let isRunning = false;
export const startReportCron = () => {
  cron.schedule(
    "0 0 * * *",
    async () => {
      if (isRunning) {
        console.log("⏭ Cron already running, skipping");
        return;
      }
      isRunning = true;
      console.log("🕒 Cron running:", new Date().toISOString());
      try {
        const pdfReport = await createReportPDF();
        if (!pdfReport) {
          console.log("⏭ No PDF generated");
          return;
        }
        const fileData = await uploadToDrive(pdfReport);
        await updateTodayReports(fileData.viewLink, fileData.fileId);
        console.log("✅ Daily report processed successfully");
      } catch (err) {
        console.error("❌ Cron error:", err);
      } finally {
        isRunning = false;
      }
    },
    {
      timezone: "Asia/Jakarta",
    }
  );
};

async function getTodayReports() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return Report.find({
    createdAt: { $gte: start, $lte: end },
  })
    .populate("userId", "firstName lastName")
    .populate("patrolPointId", "name")
    .sort({ createdAt: 1 });
}

const createReportPDF = async () => {
  try {
    const reports = await getTodayReports();

    if (reports.length === 0) {
      console.log("No reports today");
      return;
    }

    const reportIds = reports.map((report) => report._id);

    const reportImages = await ReportImages.find({
      reportId: { $in: reportIds },
    });

    const imagesByReportId = {};
    for (const image of reportImages) {
      const key = image.reportId.toString();
      if (!imagesByReportId[key]) {
        imagesByReportId[key] = [];
      }
      imagesByReportId[key].push(image);
    }

    const pdfReport = await generateUploadPDF(reports, imagesByReportId);
    console.log("✅ Daily report PDF generated");
    return pdfReport;
  } catch (error) {
    console.error("❌ createReportPDF error:", error);
  }
};

const updateTodayReports = async (documentUrl, documentFileId) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const result = await Report.updateMany(
      {
        createdAt: {
          $gte: start,
          $lte: end,
        },
      },
      {
        $set: {
          documentUrl,
          documentFileId,
          updatedAt: new Date(),
        },
      }
    );
    console.log("Matched:", result.matchedCount);
    console.log("Modified:", result.modifiedCount);
  } catch (error) {
    console.error("Update failed:", error);
  }
};
