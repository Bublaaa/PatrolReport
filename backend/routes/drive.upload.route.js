import express from "express";
import { uploadPDFLimiter } from "../middlewares/rateLimiter.js";
import { uploadPDF } from "../middlewares/multer.js";
import { uploadToDrive } from "../controllers/drive.upload.controller.js";

const router = express.Router();

router.post(
  "/upload",
  uploadPDFLimiter,
  uploadPDF.single("file"),
  uploadToDrive,
);

export default router;
