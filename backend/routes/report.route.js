import express from "express";
import {
  getAllReports,
  getReportDetail,
  getReportByDate,
  createReport,
  updateReport,
  deleteReport,
} from "../controllers/report.controller.js";
import { uploadReportImages } from "../middlewares/multer.js";
import { downloadPDF } from "../controllers/report.controller.js";

const router = express.Router();

// GET ALL REPORTS
router.get("/get", getAllReports);

// GET ALL REPORTS
router.get("/:date", getReportByDate);

// GET REPORT DETAIL
router.get("/get/:id", getReportDetail);

// CREATE NEW REPORT
// router.post("/create", createReport);
router.post("/create", uploadReportImages.array("images", 5), createReport);

router.post("/export/pdf", downloadPDF);

// UPDATE REPORT
router.put("/update/:id", updateReport);

// DELETE REPORT
router.delete("/delete/:id", deleteReport);

export default router;
