import express from "express";
import {
  createReportImages,
  getReportImagesByReportId,
  updateReportImages,
  deleteReportImages,
  getAllReportImages,
  deleteAllReportImages,
} from "../controllers/report.images.controller.js";
import { reportImagesLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// GET ALL REPORT IMAGES
router.get("/get", getAllReportImages);

// GET REPORT IMAGES  DETAIL
router.get("/:id", getReportImagesByReportId);

// CREATE NEW REPORT IMAGES
router.post("/create", reportImagesLimiter, createReportImages);

// UPDATE REPORT IMAGES
router.put("/update/:id", reportImagesLimiter, updateReportImages);

// DELETE REPORT IMAGES
router.delete("/delete/:id", reportImagesLimiter, deleteReportImages);

// DELETE ALL REPORT  IMAGES
router.delete("/delete-all", deleteAllReportImages);

export default router;
