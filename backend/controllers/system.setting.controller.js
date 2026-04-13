import { SystemSetting } from "../models/SystemSetting.js";

export const createDriveFolderId = async (req, res) => {
  try {
    const { link } = req.body;
    const linkParts = link.split("/");
    const folderId = linkParts[linkParts.length - 1];

    if (!folderId) {
      return res.status(400).json({
        success: false,
        message: req.t("system_setting.folder_id_error"),
      });
    }

    const isExist = await SystemSetting.findOne({
      key: "GOOGLE_DRIVE_REPORT_FOLDER_ID",
    });
    if (isExist) {
      return res.status(400).json({
        success: false,
        message: req.t("system_setting.folder_id_exist_error"),
      });
    }

    const newSetting = new SystemSetting({
      key: "GOOGLE_DRIVE_REPORT_FOLDER_ID",
      value: folderId,
    });

    await newSetting.save();

    res.status(201).json({
      success: true,
      message: req.t("system_setting.drive_id_create_success"),
      setting: newSetting,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: req.t("common.server_error") });
  }
};

export const getDriveFolderId = async (req, res) => {
  try {
    const setting = await SystemSetting.findOne({
      key: "GOOGLE_DRIVE_REPORT_FOLDER_ID",
    });
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: req.t("system_setting.drive_id_not_found_error"),
      });
    }
    res.status(200).json({
      success: true,
      message: req.t("system_setting.drive_id_found_success"),
      folderId: setting.value,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: req.t("common.server_error") });
  }
};

export const updateDriveFolderId = async (req, res) => {
  try {
    const { link } = req.body;
    const linkParts = link.split("/");
    const folderId = linkParts[linkParts.length - 1];

    if (!folderId) {
      return res.status(400).json({
        success: false,
        message: req.t("system_setting.folder_id_error"),
      });
    }
    const updatedSetting = await SystemSetting.findOneAndUpdate(
      { key: "GOOGLE_DRIVE_REPORT_FOLDER_ID" },
      { value: folderId },
      { new: true, runValidators: true },
    );
    if (!updatedSetting) {
      return res.status(404).json({
        success: false,
        message: req.t("system_setting.drive_id_not_found_error"),
      });
    }
    res.status(200).json({
      success: true,
      message: req.t("system_setting.drive_id_updated_success"),
      setting: updatedSetting,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: req.t("common.server_error") });
  }
};

export const getAllSystemSettings = async (req, res) => {
  try {
    const settings = await SystemSetting.find({});
    res.status(200).json({
      success: true,
      message: req.t("system_setting.get_all_success"),
      settings: settings,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: req.t("common.server_error") });
  }
};
