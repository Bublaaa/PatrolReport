import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { connection } from "./database/connection.js";
import authRoutes from "./routes/auth.routes.js";
import outpostRoutes from "./routes/outpost.routes.js";
import shiftRoutes from "./routes/shift.routes.js";
import scheduleRoutes from "./routes/schedule.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import { report } from "process";

dotenv.config();

const app = express();
const port = process.env.PORT || 5003;
const __dirname = path.resolve();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(express.json()); // Allow to parse incoming requests with json "req.body"
app.use(cookieParser());

// Prefix for auth routes "/api/auth/login"
app.use("/api/auth", authRoutes);
app.use("/api/outpost", outpostRoutes);
app.use("/api/shift", reportRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

app.listen(port, () => {
  connection();
  console.log("Server is running on port:", port);
});
