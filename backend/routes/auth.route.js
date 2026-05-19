import express from "express";
import {
  login,
  logout,
  checkAuth,
  createAuth,
  updateAuth,
  updateProfile,
  deleteAuth,
  getAllAuths,
  getAuthDetail,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { authLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.get("/check-auth", verifyToken, checkAuth);
router.get("/get", getAllAuths);
router.get("/get/:id", getAuthDetail);
router.post("/login", authLimiter, login);
router.post("/logout", authLimiter, logout);
router.post("/create", authLimiter, createAuth);
router.put("/update/:id", authLimiter, updateAuth);
router.put("/profile/update/:id", authLimiter, updateProfile);
router.delete("/delete/:id", authLimiter, deleteAuth);

export default router;
