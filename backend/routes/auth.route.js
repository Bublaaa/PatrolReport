import express from "express";
import {
  login,
  logout,
  checkAuth,
  createAuth,
  updateAuth,
  deleteAuth,
  getAllAuths,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/check-auth", verifyToken, checkAuth);
router.get("/get", getAllAuths);
router.post("/login", login);
router.post("/logout", logout);
router.post("/create", createAuth);
router.put("/update", updateAuth);
router.delete("/delete/:id", deleteAuth);

export default router;
