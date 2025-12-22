import express from "express";
import {
  getAllPatrolPoints,
  getPatrolPointsDetail,
  createPatrolPoint,
  updatePatrolPoint,
  deletePatrolPoint,
  generatePatrolPointBarcode,
} from "../controllers/patrol.point.controller.js";

const router = express.Router();

// GET ALL PATROL POINTS
router.get("/get", getAllPatrolPoints);

// GET PATROL POINT DETAIL
router.get("/:id", getPatrolPointsDetail);

// CREATE NEW PATROL POINT
router.post("/create", createPatrolPoint);

// UPDATE PATROL POINT
router.put("/update/:id", updatePatrolPoint);

// DELETE PATROL POINT
router.delete("/delete/:id", deletePatrolPoint);

router.post("/generate-qr", generatePatrolPointBarcode);

export default router;
