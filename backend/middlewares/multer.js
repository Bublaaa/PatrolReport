import multer from "multer";
import fs from "fs";
import crypto from "crypto";

// * DIRECTORY
const uploadDir = "uploads/report-images";
const uploadPDFDir = "uploads/report-pdf";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(uploadPDFDir)) {
  fs.mkdirSync(uploadPDFDir, { recursive: true });
}

// * IMAGE
const sanitize = (value, fallback) =>
  value ? value.replace(/[^a-zA-Z0-9_-]/g, "") : fallback;

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
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
    cb(null, uploadPDFDir);
  },

  filename: (req, file, cb) => {
    const date = new Date().toISOString().split("T")[0];
    const unique = crypto.randomBytes(4).toString("hex");

    cb(null, `report-${date}-${unique}.pdf`);
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
