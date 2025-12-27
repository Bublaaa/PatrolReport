import express from "express";
import {
  createReportImages,
  getReportImagesByReportId,
  updateReportImages,
  deleteReportImages,
} from "../controllers/report.images.controller.js";

const router = express.Router();

// GET ALL REPORTS

// GET REPORT DETAIL
router.get("/:id", getReportImagesByReportId);

// CREATE NEW REPORT
router.post("/create", createReportImages);

// UPDATE REPORT
router.put("/update/:id", updateReportImages);

// DELETE REPORT
router.delete("/delete/:id", deleteReportImages);

export default router;
