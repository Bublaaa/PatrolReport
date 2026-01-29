import { Report } from "../models/Report.js";
import { PatrolPoint } from "../models/PatrolPoint.js";
import { User } from "../models/User.js";
import { ReportImages } from "../models/ReportImages.js";
import { generateDownloadPDF } from "../utils/report.pdf.generator.js";
import { isWithinPatrolRadius } from "../../frontend/src/utils/location.js";
import { fromZonedTime } from "date-fns-tz";

//* GET BY DATE
export const getReportByDate = async (req, res) => {
  try {
    const { date } = req.params;
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Selected date is required",
      });
    }
    const startOfDay = new Date(`${date}T00:00:00+07:00`);
    const endOfDay = new Date(`${date}T23:59:59.999+07:00`);

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
      reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
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
    const report = await Report.findById(id)
      .populate({
        path: "userId",
        select: "firstName lastName",
      })
      .populate({
        path: "patrolPointId",
        select: "name",
      });
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
  const { userId, patrolPointId, report, latitude, longitude, accuracy } =
    req.body;
  const images = req.files?.map((f) => f.path) || [];
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
      patrolPoint.longitude,
    );
    const isAllowedRadius = isWithinPatrolRadius({
      userLat: latitude,
      userLon: longitude,
      pointLat: patrolPoint.latitude,
      pointLon: patrolPoint.longitude,
      gpsAccuracy: accuracy,
    });
    const allowedRadius = isAllowedRadius.allowedRadius || 15;

    if (distance > allowedRadius) {
      return res.status(403).json({
        success: false,
        message: `Too far from patrol point.
     Distance: ${Math.round(isAllowedRadius.distance)}m
     GPS accuracy: ±${Math.round(accuracy)}m`,
      });
    }
    // if (distance > 15) {
    //   return res.status(403).json({
    //     success: false,
    //     message: `You are too far from the patrol point (${distance.toFixed(
    //       2,
    //     )}m). Maximum allowed is 15m. Please recalibrate your position`,
    //   });
    // }

    const newReport = new Report({
      userId,
      patrolPointId,
      report,
    });

    if (req.files?.length > 0) {
      const imageDocs = req.files.map((file) => ({
        reportId: newReport._id,
        filePath: `/uploads/report-images/${file.filename}`,
      }));

      await ReportImages.insertMany(imageDocs);
    }

    // if (req.files?.length > 0) {
    //   const imageDocs = req.files.map((file) => ({
    //     reportId: newReport._id,
    //     filePath: file.path,
    //   }));
    //   await ReportImages.insertMany(imageDocs);
    // }

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
      { new: true, runValidators: true },
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
    const isReportImagesExist = ReportImages.find({ id });
    if (isReportImagesExist.length > 0) {
      for (const image in isReportImagesExist) {
        await ReportImages.findByIdAndDelete(image.id);
      }
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

// * GENERATE PDF
export const downloadPDF = async (req, res) => {
  try {
    const { date, userId, patrolPointId } = req.body;

    const start = fromZonedTime(`${date} 00:00:00`, "Asia/Jakarta");
    const end = fromZonedTime(`${date} 23:59:59.999`, "Asia/Jakarta");

    const reports = await Report.find({
      createdAt: { $gte: start, $lte: end },
    })
      .populate("userId", "firstName lastName")
      .populate("patrolPointId", "name")
      .sort({ createdAt: 1 });
    if (!reports.length) {
      return res.status(404).json({ message: "No reports found" });
    }

    const reportIds = reports.map((report) => report._id);
    const reportImagesByReportId = await ReportImages.find({
      reportId: { $in: reportIds },
    });

    const imagesByReportId = {};

    reportImagesByReportId.forEach((image) => {
      const key = image.reportId.toString();
      if (!imagesByReportId[key]) {
        imagesByReportId[key] = [];
      }
      imagesByReportId[key].push(image);
    });

    generateDownloadPDF(res, reports, imagesByReportId);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
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
