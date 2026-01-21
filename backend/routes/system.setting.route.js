import express from "express";
import {
  getAllSystemSettings,
  getDriveFolderId,
  updateDriveFolderId,
  createDriveFolderId,
} from "../controllers/system.setting.controller.js";

const router = express.Router();

router.get("/get", getAllSystemSettings);
router.get("/get-drive-id", getDriveFolderId);
router.post("/create-drive-id", createDriveFolderId);
router.put("/update-drive-id/", updateDriveFolderId);

export default router;
