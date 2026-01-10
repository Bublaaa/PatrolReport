import cron from "node-cron";
import fs from "fs";
import sharp from "sharp";
import { Report } from "../models/Report.js";
import { ReportImages } from "../models/ReportImages.js";

export const startReportCron = () => {
  cron.schedule(
    "0 0 * * *",
    async () => {
      console.log("🕒 Cron running:", new Date().toISOString());

      try {
        // Your logic here
      } catch (err) {
        console.error("❌ Cron error:", err);
      }
    },
    {
      timezone: "Asia/Jakarta",
    }
  );
};
