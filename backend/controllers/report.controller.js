import { Report } from "../models/Report.js";
import { PatrolPoint } from "../models/PatrolPoint.js";
import { User } from "../models/User.js";
import { formatDateToString } from "../../frontend/src/utils/dateTimeFormatter.js";

//* GET BY DATE
export const getReportByDate = async (req, res) => {
  const { date } = req.params;
  try {
    if (!date) {
      return res
        .status(400)
        .json({ success: false, message: "Selected date is required" });
    }
    // Start of selected day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    // End of selected day
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const reports = await Report.find({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .populate({
        path: "userId",
        select: "firstName lastName",
      })
      .populate({
        path: "patrolPointId",
        select: "name",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Successfully retrieved report",
      reports: reports,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//* GET ALL
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    if (reports.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No reports found", reports: [] });
    }
    res.status(200).json({
      success: true,
      message: "Successfully retrieved all reports",
      reports,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// * GET DETAIL
export const getReportDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const report = await Report.findById(id);
    if (!report) {
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
    }
    res.status(200).json({
      success: true,
      message: "Successfully retrieved report detail",
      report: report,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//* CREATE
export const createReport = async (req, res) => {
  const { userId, patrolPointId, report, latitude, longitude } = req.body;

  try {
    if (
      !userId ||
      !patrolPointId ||
      !report ||
      latitude == null ||
      longitude == null
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const patrolPoint = await PatrolPoint.findById(patrolPointId);
    if (!patrolPoint) {
      return res.status(404).json({
        success: false,
        message: "Patrol point not found",
      });
    }

    const distance = calculateDistance(
      latitude,
      longitude,
      patrolPoint.latitude,
      patrolPoint.longitude
    );

    if (distance > 15) {
      return res.status(403).json({
        success: false,
        message: `You are too far from the patrol point (${distance.toFixed(
          2
        )}m). Maximum allowed is 15m.`,
      });
    }

    const newReport = new Report({
      userId,
      patrolPointId,
      report,
    });

    await newReport.save();

    res.status(201).json({
      success: true,
      message: "Report created successfully",
      report: newReport,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//* UPDATE
export const updateReport = async (req, res) => {
  const { id } = req.params;
  const { userId, patrolPointId, report } = req.body;

  try {
    if (!userId || !patrolPointId || !report) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    const isReportExist = await Report.findById(id);
    if (!isReportExist) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    const updatedReport = await Report.findByIdAndUpdate(
      id,
      {
        userId,
        patrolPointId,
        report,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Report updated successfully",
      report: updatedReport,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// * DELETE
export const deleteReport = async (req, res) => {
  const { id } = req.params;
  try {
    const isReportExist = await Report.findById(id);
    if (!isReportExist) {
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
    }
    await Report.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ** Utils Function
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers (3958.8 for miles)
  const toRad = (degree) => (degree * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000; // returns distance in meters
}
