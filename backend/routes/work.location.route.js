import express from "express";
import {
  getAllWorkLocations,
  getWorkLocationDetail,
  createWorkLocation,
  updateWorkLocation,
  deleteWorkLocation,
} from "../controllers/work.location.controller.js";

const router = express.Router();

// GET ALL WORK LOCATIONS
router.get("/get", getAllWorkLocations);

// GET WORK LOCATION DETAIL
router.get("/:id", getWorkLocationDetail);

// CREATE NEW WORK LOCATION
router.post("/create", createWorkLocation);

// UPDATE WORK LOCATION
router.put("/update/:id", updateWorkLocation);

// DELETE WORK LOCATION
router.delete("/delete/:id", deleteWorkLocation);

export default router;
