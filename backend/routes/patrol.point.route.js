import express from "express";
import {
  getAllPatrolPoints,
  getPatrolPointsDetail,
  createPatrolPoint,
  updatePatrolPoint,
  deletePatrolPoint,
  generatePatrolPointBarcode,
} from "../controllers/patrol.point.controller.js";
import { patrolReportLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// GET ALL PATROL POINTS
router.get("/get", getAllPatrolPoints);

// GET PATROL POINT DETAIL
router.get("/:id", getPatrolPointsDetail);

// CREATE NEW PATROL POINT
router.post("/create", patrolReportLimiter, createPatrolPoint);

// UPDATE PATROL POINT
router.put("/update/:id", patrolReportLimiter, updatePatrolPoint);

// DELETE PATROL POINT
router.delete("/delete/:id", patrolReportLimiter, deletePatrolPoint);

router.post("/generate-qr", generatePatrolPointBarcode);

export default router;
