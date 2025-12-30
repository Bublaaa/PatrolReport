import express from "express";
import {
  createReportImages,
  getReportImagesByReportId,
  updateReportImages,
  deleteReportImages,
  getAllReportImages,
} from "../controllers/report.images.controller.js";
import { get } from "mongoose";

const router = express.Router();

// GET ALL REPORTS
router.get("/get", getAllReportImages);

// GET REPORT DETAIL

router.get("/:id", getReportImagesByReportId);

// CREATE NEW REPORT
router.post("/create", createReportImages);

// UPDATE REPORT
router.put("/update/:id", updateReportImages);

// DELETE REPORT
router.delete("/delete/:id", deleteReportImages);

export default router;
