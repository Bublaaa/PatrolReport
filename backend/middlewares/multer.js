import multer from "multer";
import fs from "fs";
import crypto from "crypto";

const uploadDir = "uploads/report-images";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const sanitize = (value, fallback) =>
  value ? value.replace(/[^a-zA-Z0-9_-]/g, "") : fallback;

const storage = multer.diskStorage({
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

const fileFilter = (req, file, cb) => {
  if (file.mimetype !== "image/webp") {
    return cb(new Error("Only WEBP images are allowed"), false);
  }
  cb(null, true);
};

export const uploadReportImages = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
