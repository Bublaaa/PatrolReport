import cron from "node-cron";
import fs from "fs";
import path from "path";
import { Report } from "../models/Report.js";
import { ReportImages } from "../models/ReportImages.js";
import { generateUploadPDF } from "../utils/report.pdf.generator.js";
import { uploadToDrive } from "../controllers/drive.upload.controller.js";

const PDF_DIR = path.join(process.cwd(), "uploads/report-pdf");

let isCronRunning = false;

export const startReportCron = () => {
  cron.schedule(
    "0 0 * * *",
    async () => {
      if (isCronRunning) {
        console.log("[CRON] Already running, skipping");
        return;
      }

      const startTime = Date.now();
      isCronRunning = true;

      const stats = {
        generatedReports: 0,
        skippedReports: 0,
        recoveredReports: 0,
        imagesDeleted: 0,
        pdfDeleted: 0,
      };

      console.log("\n================ REPORT CRON START ================");
      console.log(
        "[CRON START]",
        new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
      );

      try {
        stats.generatedReports += await generateYesterdayReport();
        stats.recoveredReports += await generateMissingReports();
        stats.imagesDeleted += await cleanupImages();
        stats.pdfDeleted += await cleanupLocalPDF();
      } catch (err) {
        console.error("[CRON ERROR]", err);
      } finally {
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log("\n----------- CRON SUMMARY -----------");
        console.log("Generated reports:", stats.generatedReports);
        console.log("Recovered reports:", stats.recoveredReports);
        console.log("Images deleted:", stats.imagesDeleted);
        console.log("Local PDFs deleted:", stats.pdfDeleted);
        console.log("Execution time:", duration, "seconds");
        console.log("====================================\n");

        isCronRunning = false;
      }
    },
    { timezone: "Asia/Jakarta" },
  );
};

async function generateYesterdayReport() {
  console.log("[PROCESS] generateYesterdayReport START");

  const start = new Date();
  start.setDate(start.getDate() - 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setHours(23, 59, 59, 999);

  const existing = await Report.exists({
    createdAt: { $gte: start, $lte: end },
    documentUrl: { $exists: true },
  });

  if (existing) {
    console.log("[SKIP] Yesterday report already generated");
    return 0;
  }

  const reports = await getReportsBetween(start, end);

  if (!reports.length) {
    console.log("[SKIP] No reports yesterday");
    return 0;
  }

  await processReportBatch(reports, start);

  console.log("[SUCCESS] Yesterday report generated");
  return 1;
}

async function getMissingReportDates() {
  const reports = await Report.find({
    documentUrl: { $exists: false },
  }).select("createdAt");

  const uniqueDates = [
    ...new Set(
      reports.map((r) => new Date(r.createdAt).toISOString().split("T")[0]),
    ),
  ];
  console.log("Missing report dates:", uniqueDates);

  return uniqueDates;
}

async function generateMissingReports() {
  console.log("[PROCESS] generateMissingReports START");

  const dates = await getMissingReportDates();
  let recoveredCount = 0;

  for (const date of dates) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const reports = await getReportsBetween(start, end);

    if (!reports.length) continue;

    await processReportBatch(reports, start);

    recoveredCount++;

    console.log(`[RECOVERY SUCCESS] ${start.toISOString().split("T")[0]}`);
  }

  console.log("[PROCESS END] generateMissingReports");

  return recoveredCount;
}

async function getReportsBetween(start, end) {
  const reports = await Report.find({
    createdAt: { $gte: start, $lte: end },
  })
    .populate("userId", "firstName lastName")
    .populate("patrolPointId", "name")
    .sort({ createdAt: 1 })
    .lean();

  console.log("Reports fetched:", reports.length);

  return reports;
}

async function processReportBatch(reports, startDate) {
  console.log(
    "[PROCESS] Generating PDF for",
    startDate.toISOString().split("T")[0],
  );

  const reportIds = reports.map((r) => r._id);

  const images = await ReportImages.find({
    reportId: { $in: reportIds },
  }).lean();

  console.log("Images fetched:", images.length);

  const imagesByReportId = {};

  for (const img of images) {
    const key = img.reportId.toString();

    if (!imagesByReportId[key]) {
      imagesByReportId[key] = [];
    }

    imagesByReportId[key].push(img);
  }

  const pdf = await generateUploadPDF(reports, imagesByReportId);

  const file = await uploadToDrive(pdf);

  await Report.updateMany(
    { _id: { $in: reportIds } },
    {
      $set: {
        documentUrl: file.viewLink,
        documentFileId: file.fileId,
      },
    },
  );

  console.log("[UPLOAD SUCCESS]", startDate.toISOString().split("T")[0]);
}

async function cleanupImages() {
  console.log("[PROCESS] cleanupImages START");

  const reports = await Report.find({
    documentUrl: { $exists: true },
  }).select("_id");

  const reportIds = reports.map((r) => r._id);

  const images = await ReportImages.find({
    reportId: { $in: reportIds },
  }).lean();

  let deletedCount = 0;

  for (const img of images) {
    const imagePath = path.join(process.cwd(), img.filePath);

    if (fs.existsSync(imagePath)) {
      await fs.promises.unlink(imagePath);
      deletedCount++;
    }
  }

  await ReportImages.deleteMany({
    reportId: { $in: reportIds },
  });

  console.log("Images deleted:", deletedCount);

  return deletedCount;
}

async function cleanupLocalPDF() {
  console.log("[PROCESS] cleanupLocalPDF START");

  if (!fs.existsSync(PDF_DIR)) return 0;

  const files = await fs.promises.readdir(PDF_DIR);

  let deletedCount = 0;

  for (const file of files) {
    const filePath = path.join(PDF_DIR, file);

    await fs.promises.unlink(filePath);

    deletedCount++;
  }

  console.log("Local PDFs deleted:", deletedCount);

  return deletedCount;
}
