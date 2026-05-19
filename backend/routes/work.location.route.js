import express from "express";
import {
  getAllWorkLocations,
  getWorkLocationDetail,
  createWorkLocation,
  updateWorkLocation,
  deleteWorkLocation,
} from "../controllers/work.location.controller.js";
import { workLocationLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// GET ALL WORK LOCATIONS
router.get("/get", getAllWorkLocations);

// GET WORK LOCATION DETAIL
router.get("/:id", getWorkLocationDetail);

// CREATE NEW WORK LOCATION
router.post("/create", workLocationLimiter, createWorkLocation);

// UPDATE WORK LOCATION
router.put("/update/:id", workLocationLimiter, updateWorkLocation);

// DELETE WORK LOCATION
router.delete("/delete/:id", workLocationLimiter, deleteWorkLocation);

export default router;
