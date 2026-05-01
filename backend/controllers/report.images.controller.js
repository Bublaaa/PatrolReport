import { ReportImages } from "../models/ReportImages.js";
import { Report } from "../models/Report.js";
import mongoose from "mongoose";

//* CREATE
export const createReportImages = async (req, res) => {
  const { reportId, fileName, localKey } = req.body;
  try {
    if (!reportId || !fileName || !localKey) {
      return res.status(400).json({
        success: false,
        message: req.t("common.required_fields"),
      });
    }
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: req.t("report.report_not_found"),
      });
    }
    const reportImage = new ReportImages({
      reportId,
      fileName,
      localKey,
    });
    await reportImage.save();
    res.status(201).json({
      success: true,
      message: req.t("report_images.create_success"),
      reportImage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: req.t("common.server_error"),
    });
  }
};

// ** GET ALL
export const getAllReportImages = async (req, res) => {
  try {
    const reportImages = await ReportImages.find();
    res.status(200).json({
      success: true,
      message: req.t("report.get_all_success"),
      reportImages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: req.t("common.server_error"),
    });
  }
};

// * GET BY REPORT ID
export const getReportImagesByReportId = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: req.t("common.invalid_id"),
    });
  }
  try {
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: req.t("report.report_not_found"),
      });
    }

    const reportImages = await ReportImages.find({ reportId: id });

    res.status(200).json({
      success: true,
      message: req.t("report_images.get_detail_success"),
      reportImages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: req.t("common.server_error"),
    });
  }
};

// * UPDATE
export const updateReportImages = async (req, res) => {
  const { id } = req.params;
  const { reportId, fileName, localKey } = req.body;
  try {
    const isReportImageExist = await ReportImages.findById(id);
    if (!isReportImageExist) {
      return res.status(404).json({
        success: false,
        message: req.t("report_images.not_found_error"),
      });
    }
    if (!reportId || !fileName || !localKey) {
      return res.status(400).json({
        success: false,
        message: req.t("common.required_fields"),
      });
    }
    const updatedReportImage = await ReportImages.findByIdAndUpdate(
      id,
      {
        reportId,
        fileName,
        localKey,
      },
      { new: true, runValidators: true },
    );
    res.status(200).json({
      success: true,
      message: req.t("report_images.update_success"),
      reportImage: updatedReportImage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: req.t("common.server_error"),
    });
  }
};

// * DELETE
export const deleteReportImages = async (req, res) => {
  const { id } = req.params;
  try {
    const isReportImageExist = await ReportImages.findById(id);
    if (!isReportImageExist) {
      return res
        .status(404)
        .json({ success: false, message: "Report image not found" });
    }
    await ReportImages.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: req.t("report_images.delete_success"),
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: req.t("common.server_error") });
  }
};

// * DELETE ALL
export const deleteAllReportImages = async (req, res) => {
  try {
    const images = await ReportImages.find();

    // for (const img of images) {
    //   if (fs.existsSync(img.filePath)) {
    //     fs.unlinkSync(img.filePath);
    //   }
    // }

    await ReportImages.deleteMany();

    return res.status(200).json({
      success: true,
      message: req.t("report_images.delete_all_success"),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: req.t("common.server_error"),
    });
  }
};
