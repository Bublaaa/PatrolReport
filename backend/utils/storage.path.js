import path from "path";
import fs from "fs";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Root directory for uploaded files
 * - Render: persistent disk
 * - Local: project/uploads
 */
export const UPLOAD_ROOT = isProduction
  ? "/uploads"
  : path.resolve(process.cwd(), "uploads");

/**
 * Sub-directories
 */
export const REPORT_IMAGES_DIR = path.join(UPLOAD_ROOT, "report-images");

export const REPORT_PDF_DIR = path.join(UPLOAD_ROOT, "report-pdf");

/**
 * Ensure directories exist
 */
[UPLOAD_ROOT, REPORT_IMAGES_DIR, REPORT_PDF_DIR].forEach((dir) => {
  fs.mkdirSync(dir, { recursive: true });
});
