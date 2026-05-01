import { Auth } from "../models/Auth.js";
import { Report } from "../models/Report.js";
import { PatrolPoint } from "../models/PatrolPoint.js";
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
        message: req.t("report.selected_date_required"),
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

    if (reports.length === 0) {
      return res.status(404).json({
        success: false,
        message: req.t("report.report_not_found"),
        reports: [],
      });
    }
    res.status(200).json({
      success: true,
      message: req.t("report.get_detail_success"),
      reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: req.t("common.server_error"),
    });
  }
};

//* GET REPORT BY MONTH
export const getReportByMonth = async (req, res) => {
  try {
    const { month } = req.params;

    if (!month) {
      return res.status(400).json({
        success: false,
        message: req.t("report.selected_month_required"),
      });
    }

    // month format: YYYY-MM
    const [yearStr, monthStr] = month.split("-");
    const year = Number(yearStr);
    const monthIndex = Number(monthStr);

    // Start of month
    const startOfMonth = new Date(year, monthIndex - 1, 2, 0, 0, 0, 0);
    const endOfMonth = new Date(year, monthIndex, 0, 23, 59, 59, 999);

    const reports = await Report.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        },
      },

      { $sort: { createdAt: 1 } },

      {
        $lookup: {
          from: "patrolpoints",
          let: { patrolPointId: "$patrolPointId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$patrolPointId"] } } },
            { $project: { _id: 1, name: 1, workLocationId: 1 } },
          ],
          as: "patrolPoint",
        },
      },
      { $unwind: "$patrolPoint" },

      {
        $lookup: {
          from: "worklocations",
          let: { workLocationId: "$patrolPoint.workLocationId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$workLocationId"] } } },
            { $project: { _id: 1, name: 1 } },
          ],
          as: "workLocation",
        },
      },
      { $unwind: "$workLocation" },

      {
        $lookup: {
          from: "auths",
          let: { userId: "$userId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
            { $project: { _id: 1, firstName: 1, lastName: 1 } },
          ],
          as: "user",
        },
      },
      { $unwind: "$user" },

      {
        $group: {
          _id: "$workLocation._id",
          workLocation: { $first: "$workLocation" },

          totalReports: { $sum: 1 },

          reports: {
            $push: {
              _id: "$_id",
              report: "$report",
              createdAt: "$createdAt",
              userId: {
                _id: "$user._id",
                firstName: "$user.firstName",
                lastName: "$user.lastName",
              },
              patrolPointId: {
                _id: "$patrolPoint._id",
                name: "$patrolPoint.name",
              },
            },
          },
        },
      },

      {
        $project: {
          _id: 0,
          workLocation: 1,
          totalReports: 1,
          reports: 1,
        },
      },

      { $sort: { totalReports: -1 } },
    ]);
    if (reports.length === 0) {
      return res.status(404).json({
        success: false,
        message: req.t("report.monthly_report_not_found"),
        reports: [],
      });
    }
    return res.status(200).json({
      success: true,
      message: req.t("report.get_all_success"),
      reports,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: req.t("common.server_error"),
    });
  }
};

//* GET ALL
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    if (reports.length === 0) {
      return res.status(404).json({
        success: false,
        message: req.t("report.report_not_found"),
        reports: [],
      });
    }
    res.status(200).json({
      success: true,
      message: req.t("report.get_all_success"),
      reports,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: req.t("common.server_error") });
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
        .json({ success: false, message: req.t("report.report_not_found") });
    }
    res.status(200).json({
      success: true,
      message: req.t("report.get_detail_success"),
      report: report,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: req.t("common.server_error") });
  }
};

//* CREATE
export const createReport = async (req, res) => {
  const { userId, patrolPointId, report, latitude, longitude, accuracy } =
    req.body;
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
        message: req.t("common.required_fields"),
      });
    }

    const user = await Auth.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: req.t("auth.user_not_found"),
      });
    }

    const patrolPoint = await PatrolPoint.findById(patrolPointId);
    if (!patrolPoint) {
      return res.status(404).json({
        success: false,
        message: req.t("patrol_point.patrol_point_not_found"),
      });
    }

    const result = isWithinPatrolRadius({
      userLat: latitude,
      userLon: longitude,
      pointLat: patrolPoint.latitude,
      pointLon: patrolPoint.longitude,
      gpsAccuracy: accuracy,
    });

    if (!result.valid) {
      return res.status(403).json({
        success: false,
        message: req.t("report.too_far_from_patrol_point_error"),
        //     message: `Too far from patrol point.
        //  Distance: ${Math.round(isAllowedRadius.distance)}m
        //  GPS accuracy: ±${Math.round(accuracy)}m`,
      });
    }

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
    await newReport.save();

    res.status(201).json({
      success: true,
      message: req.t("report.create_success"),
      report: newReport,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: req.t("common.server_error"),
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
        message: req.t("common.required_fields"),
      });
    }

    const isReportExist = await Report.findById(id);
    if (!isReportExist) {
      return res.status(404).json({
        success: false,
        message: req.t("report.report_not_found"),
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
      message: req.t("report.update_success"),
      report: updatedReport,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: req.t("common.server_error") });
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
        .json({ success: false, message: req.t("report.report_not_found") });
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
      message: req.t("report.delete_success"),
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: req.t("common.server_error") });
  }
};

// * GENERATE PDF
export const downloadPDF = async (req, res) => {
  try {
    const { reports } = req.body;

    // const start = new Date(date);
    // start.setHours(0, 0, 0, 0);

    // const end = new Date(date);
    // end.setHours(23, 59, 59, 999);

    // const query = {
    //   createdAt: { $gte: start, $lte: end },
    // };

    // const reports = await Report.find(query)
    //   .populate("userId", "firstName lastName")
    //   .populate("patrolPointId", "name")
    //   .sort({ createdAt: 1 });

    if (!reports.length) {
      return res
        .status(404)
        .json({ message: req.t("report.report_not_found") });
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
    res.status(500).json({ message: req.t("common.server_error") });
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
