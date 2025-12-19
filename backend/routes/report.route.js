import express from "express";
import {
  getAllReports,
  getReportDetail,
  createReport,
  updateReport,
  deleteReport,
} from "../controllers/report.controller.js";

const router = express.Router();

// GET ALL REPORTS
router.get("/get", getAllReports);

// GET REPORT DETAIL
router.get("/:id", getReportDetail);

// CREATE NEW REPORT
router.post("/create", createReport);

// UPDATE REPORT
router.put("/update/:id", updateReport);

// DELETE REPORT
router.delete("/delete/:id", deleteReport);

export default router;
