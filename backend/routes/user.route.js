import express from "express";
import {
  getAllUser,
  getUserDetail,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
const router = express.Router();

// GET ALL USERS
router.get("/all", getAllUser);

// GET USER BY ID
router.get("/:id", getUserDetail);

// CREATE NEW USER
router.post("/create", createUser);

// UPDATE USER
router.put("/update/:id", updateUser);

// DELETE USER
router.delete("/delete/:id", deleteUser);

export default router;
