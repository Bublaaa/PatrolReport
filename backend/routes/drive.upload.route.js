import express from "express";
import { uploadPDF } from "../middlewares/multer";
import { uploadToDrive } from "../controllers/drive.upload.controller";

const router = express.Router();

router.post("/upload", uploadPDF.single("pdf"), uploadToDrive);

export default router;
