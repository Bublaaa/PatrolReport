import cron from "node-cron";
import fs from "fs";
import path from "path";
import { Report } from "../models/Report.js";
import { ReportImages } from "../models/ReportImages.js";
import { generateUploadPDF } from "../utils/report.pdf.generator.js";
import { uploadToDrive } from "../controllers/drive.upload.controller.js";

// * CONSTANT
const PDF_DIR = path.join(process.cwd(), "uploads/report-pdf");

// * FLAGS
let isGeneratingRunning = false;
let isCheckingRunning = false;

// * START GENERATE DAILY REPORT
export const startDailyReport = () => {
  cron.schedule(
    "0 0 * * *",
    async () => {
      if (isGeneratingRunning) {
        console.log("Cron is already running");
        return;
      }
      isGeneratingRunning = true;
      console.log("Cron running:", new Date().toISOString());
      try {
        const report = await getTodayReports();
        const pdfReport = await createReportPDF(report);
        if (!pdfReport) {
          console.log("No PDF generated");
          return;
        }
        const fileData = await uploadToDrive(pdfReport);
        await updateTodayReports(fileData.viewLink, fileData.fileId);
        console.log("[SUCCESS] Daily report processed successfully");
      } catch (err) {
        console.error("[ERROR] Cron task :", err);
      } finally {
        isGeneratingRunning = false;
      }
    },
    {
      timezone: "Asia/Jakarta",
    }
  );
};

// * START CLEANING WEEKLY IMAGE & PDF FILES
export const cleanReportFiles = () => {
  cron.schedule(
    "0 0 * * 0",
    async () => {
      if (isCheckingRunning) {
        console.log("Cron already running, skipping");
        return;
      }
      isCheckingRunning = true;
      console.log("Weekly cleanup started:", new Date().toISOString());
      try {
        const { start, end } = getThisWeekRange();
        const reportsWithDocument = await getReportsWithDocument(start, end);
        if (reportsWithDocument.length === 0) {
          console.log("No weekly report to clean");
          return;
        }
        await cleanReportImages(reportsWithDocument);
        // await cleanImagesByWeek();
        await deleteLocalPDF(reportsWithDocument);
        console.log("Weekly cleanup finished");
      } catch (error) {
        console.error("[ERROR] Weekly cleanup:", error);
      } finally {
        isCheckingRunning = false;
      }
    },
    {
      timezone: "Asia/Jakarta",
    }
  );
};

// * GET REPORT WITH DOCUMENT URL IS NOT NULL
async function getReportsWithDocument(start, end) {
  return Report.find({
    createdAt: { $gte: start, $lte: end },
    documentUrl: { $exists: true, $ne: null },
  });
}

// * DELETE REPORT IMAGES DATA & SAVED IMAGES BY REPORT ID
async function cleanReportImages(reports) {
  const reportIds = reports.map((r) => r._id);
  console.log(reportIds);
  try {
    const reportImages = await ReportImages.find({
      reportId: { $in: reportIds },
    });
    if (reportImages.length === 0) {
      console.log("Report images not found");
      return;
    }
    for (const image of reportImages) {
      const imagePath = path.join(process.cwd(), image.filePath);
      console.log(imagePath);
      if (fs.existsSync(imagePath)) {
        await fs.promises.unlink(imagePath);
        console.log("Deleted image:", imagePath);
      } else {
        console.warn("Image not found:", imagePath);
      }
    }
    await ReportImages.deleteMany({
      reportId: { $in: reportIds },
    });
    console.log("Report images cleaned");
  } catch (error) {
    console.error("Image cleanup failed:", error.message);
  }
}

// * DELETE REPORT IMAGES DATA & SAVED IMAGES BY MATCHING DATE RANGE
async function cleanImagesByWeek() {
  const { start, end } = getThisWeekRange();
  console.log("Cleaning images from:", start, "to", end);
  const image_path = path.join(process.cwd(), "uploads/report-images");
  const files = await fs.promises.readdir(image_path);
  for (const file of files) {
    if (!file.endsWith(".webp")) continue;
    const fileDate = extractDateFromFilename(file);
    if (!fileDate) continue;
    if (fileDate >= start && fileDate <= end) {
      const fullPath = path.join(image_path, file);
      await fs.promises.unlink(fullPath);
      console.log("- Deleted:", file);
    }
  }
  console.log("Weekly image cleanup done");
}

// * DELETE LOCALLY SAVED PDF FILES
async function deleteLocalPDF(reports) {
  try {
    for (const report of reports) {
      if (!report.documentUrl) continue;
      const dateString = new Date(report.createdAt)
        .toLocaleDateString("id-ID", {
          timeZone: "Asia/Jakarta",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\//g, "-");
      const fileName = `${dateString}-report.pdf`;
      const filePath = path.join(PDF_DIR, fileName);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    }

    console.log("Local PDFs deleted");
  } catch (error) {
    console.error("PDF cleanup failed:", error.message);
  }
}

// * GET TODAY REPORTS
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

// * GENERATING DAILY REPORT PDF
const createReportPDF = async (reports) => {
  try {
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
    console.error(" Generating pdf report  error:", error);
  }
};

// * UPDATE REPORT WITH ADDING DOCUMENT URL AND FILE ID
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

// * UTILITY FUNCTION
const getThisWeekRange = () => {
  const now = new Date();
  const day = now.getDay();

  const diffToMonday = day === 0 ? -6 : 1 - day;

  const start = new Date(now);
  start.setDate(now.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

function extractDateFromFilename(filename) {
  const match = filename.match(/^report-[^-]+-[^-]+-(\d{4}-\d{2}-\d{2})-/);
  if (!match) return null;
  return new Date(match[1]);
}
