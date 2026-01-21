import { SystemSetting } from "../models/SystemSetting.js";

export const createDriveFolderId = async (req, res) => {
  try {
    const { link } = req.body;
    const linkParts = link.split("/");
    const folderId = linkParts[linkParts.length - 1];

    if (!folderId) {
      return res
        .status(400)
        .json({ success: false, message: "Failed to get folder id" });
    }

    const isExist = await SystemSetting.findOne({
      key: "GOOGLE_DRIVE_REPORT_FOLDER_ID",
    });
    if (isExist) {
      return res
        .status(400)
        .json({ success: false, message: "Folder ID already exists" });
    }

    const newSetting = new SystemSetting({
      key: "GOOGLE_DRIVE_REPORT_FOLDER_ID",
      value: folderId,
    });

    await newSetting.save();

    res.status(201).json({
      success: true,
      message: "Drive folder ID created successfully",
      setting: newSetting,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDriveFolderId = async (req, res) => {
  try {
    const setting = await SystemSetting.findOne({
      key: "GOOGLE_DRIVE_REPORT_FOLDER_ID",
    });
    if (!setting) {
      return res
        .status(404)
        .json({ success: false, message: "Drive folder ID not found" });
    }
    res.status(200).json({
      success: true,
      message: "Success get drive folder ID",
      folderId: setting.value,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDriveFolderId = async (req, res) => {
  try {
    const { link } = req.body;
    const linkParts = link.split("/");
    const folderId = linkParts[linkParts.length - 1];

    if (!folderId) {
      return res
        .status(400)
        .json({ success: false, message: "Failed to get folder id" });
    }
    const updatedSetting = await SystemSetting.findOneAndUpdate(
      { key: "GOOGLE_DRIVE_REPORT_FOLDER_ID" },
      { value: folderId },
      { new: true, runValidators: true }
    );
    if (!updatedSetting) {
      return res
        .status(404)
        .json({ success: false, message: "Drive folder ID not found" });
    }
    res.status(200).json({
      success: true,
      message: "Drive folder ID updated successfully",
      setting: updatedSetting,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllSystemSettings = async (req, res) => {
  try {
    const settings = await SystemSetting.find({});
    res.status(200).json({
      success: true,
      message: "Success get all system settings",
      settings: settings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
