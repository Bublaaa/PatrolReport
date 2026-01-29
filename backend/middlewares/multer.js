import multer from "multer";
import crypto from "crypto";
import { REPORT_PDF_DIR, REPORT_IMAGES_DIR } from "../utils/storage.path.js";

// if (!fs.existsSync(REPORT_PDF_DIR)) {
//   fs.mkdirSync(REPORT_PDF_DIR, { recursive: true });
// }
// if (!fs.existsSync(REPORT_IMAGES_DIR)) {
//   fs.mkdirSync(REPORT_IMAGES_DIR, { recursive: true });
// }

// * IMAGE
const sanitize = (value, fallback) =>
  value ? value.replace(/[^a-zA-Z0-9_-]/g, "") : fallback;

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, REPORT_IMAGES_DIR);
  },

  filename: (req, file, cb) => {
    const userId = sanitize(req.body?.userId, "unknown-user");
    const patrolPointId = sanitize(req.body?.patrolPointId, "unknown-point");
    const date = new Date().toISOString().split("T")[0];
    const unique = crypto.randomBytes(4).toString("hex");
    const filename = `report-${userId}-${patrolPointId}-${date}-${unique}.webp`;

    cb(null, filename);
  },
});
const imageFilter = (req, file, cb) => {
  if (file.mimetype !== "image/webp") {
    return cb(new Error("Only WEBP images are allowed"), false);
  }
  cb(null, true);
};

// * PDF
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, REPORT_PDF_DIR);
  },

  filename: (req, file, cb) => {
    const reportDate = req.body?.reportDate ?? new Date();
    const dateString = new Date(reportDate)
      .toLocaleDateString("id-ID", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "-");

    cb(null, `${dateString}-report.pdf`);
  },
});

const pdfFileFilter = (req, file, cb) => {
  if (file.mimetype !== "application/pdf") {
    return cb(new Error("Only PDF files are allowed"), false);
  }
  cb(null, true);
};

export const uploadReportImages = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export const uploadPDF = multer({
  storage: pdfStorage,
  fileFilter: pdfFileFilter,
});
