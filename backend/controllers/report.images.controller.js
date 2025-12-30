import { ReportImages } from "../models/ReportImages.js";
import { Report } from "../models/Report.js";

//* CREATE
export const createReportImages = async (req, res) => {
  const { reportId, fileName, localKey } = req.body;
  console.log("Parameter", reportId, fileName, localKey);
  try {
    if (!reportId || !fileName || !localKey) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
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
      message: "Report image created successfully",
      reportImage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ** GET ALL
export const getAllReportImages = async (req, res) => {
  try {
    const reportImages = await ReportImages.find();
    res.status(200).json({
      success: true,
      reportImages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// * GET BY REPORT ID
export const getReportImagesByReportId = async (req, res) => {
  const { reportId } = req.params;
  try {
    if (!reportId) {
      return res.status(404).json({
        success: false,
        message: "Report is not found",
      });
    }
    const reportImages = await ReportImages.find({ reportId });
    res.status(200).json({
      success: true,
      reportImages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
        message: "Report image not found",
      });
    }
    if (!reportId || !fileName || !localKey) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }
    const updatedReportImage = await ReportImages.findByIdAndUpdate(
      id,
      {
        reportId,
        fileName,
        localKey,
      },
      { new: true, runValidators: true }
    );
    res.status(200).json({
      success: true,
      message: "Report image updated successfully",
      reportImage: updatedReportImage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
      message: "Report image deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
