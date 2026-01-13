import cron from "node-cron";
import fs from "fs";
import sharp from "sharp";
import { Report } from "../models/Report.js";
import { ReportImages } from "../models/ReportImages.js";
import { error } from "console";
import { generateReportPDF } from "../utils/report.pdf.generator.js";

export const startReportCron = () => {
  cron.schedule(
    "0 0 * * *",
    async () => {
      console.log("🕒 Cron running:", new Date().toISOString());

      try {
        createReportPDF();
      } catch (err) {
        console.error("❌ Cron error:", err);
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

const createReportPDF = async (req, res) => {
  const reports = getTodayReports();
  const reportIds = reports.map((report) => report._id);
  const reportImagesByReportId = await ReportImages.find({
    reportId: { $in: reportIds },
  });
  const imagesByReportId = {};
  reportImagesByReportId.forEach((image) => {
    const key = image.reportId.toString();
    if (!imagesByReportId[key]) {
      imagesByReportId[key] = [];
    }
    imagesByReportId[key].push(image);
    generateReportPDF(res, reports, imagesByReportId);
  });
};
