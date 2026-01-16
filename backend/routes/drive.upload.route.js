import express from "express";
import { uploadPDF } from "../middlewares/multer.js";
import { uploadToDrive } from "../controllers/drive.upload.controller.js";

const router = express.Router();

router.post("/upload", uploadPDF.single("file"), uploadToDrive);

export default router;
