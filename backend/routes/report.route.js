import express from "express";
import {
  getAllReports,
  getReportDetail,
  getReportByDate,
  getReportByMonth,
  createReport,
  updateReport,
  deleteReport,
  downloadPDF,
} from "../controllers/report.controller.js";
import { uploadReportImages } from "../middlewares/multer.js";

const router = express.Router();

// GET ALL REPORTS
router.get("/get", getAllReports);

router.post("/export/pdf", downloadPDF);

// GET ALL REPORTS
router.get("/date/:date", getReportByDate);
router.get("/month/:month", getReportByMonth);

// GET REPORT DETAIL
router.get("/get/:id", getReportDetail);

// CREATE NEW REPORT
// router.post("/create", createReport);
router.post("/create", uploadReportImages.array("images", 5), createReport);

// UPDATE REPORT
router.put("/update/:id", updateReport);

// DELETE REPORT
router.delete("/delete/:id", deleteReport);

export default router;
