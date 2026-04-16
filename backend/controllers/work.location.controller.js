import { PatrolPoint } from "../models/PatrolPoint.js";
import { WorkLocation } from "../models/WorkLocation.js";
//* GET ALL WORK LOCATIONS
export const getAllWorkLocations = async (req, res) => {
  try {
    const workLocations = await WorkLocation.find();
    res.status(200).json({
      success: true,
      message: req.t("work_location.get_all_success"),
      workLocations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: req.t("common.server_error"),
    });
  }
};

//* GET WORK LOCATION DETAIL
export const getWorkLocationDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const workLocation = await WorkLocation.findById(id);
    if (!workLocation) {
      return res.status(404).json({
        success: false,
        message: req.t("work_location.not_found_error"),
      });
    }
    res.status(200).json({
      success: true,
      message: req.t("work_location.get_detail_success"),
      workLocation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: req.t("common.server_error"),
    });
  }
};

//* CREATE WORK LOCATION
export const createWorkLocation = async (req, res) => {
  const { name, address } = req.body;
  try {
    if (!name || !address) {
      return res.status(400).json({
        success: false,
        message: req.t("common.required_fields"),
      });
    }
    const newWorkLocation = await WorkLocation.create({ name, address });
    if (!newWorkLocation) {
      return res.status(400).json({
        success: false,
        message: req.t("work_location.create_error"),
      });
    }
    res.status(201).json({
      success: true,
      message: req.t("work_location.create_success"),
      workLocation: newWorkLocation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: req.t("common.server_error"),
    });
  }
};

//* UPDATE WORK LOCATION
export const updateWorkLocation = async (req, res) => {
  const { id } = req.params;
  const { name, address } = req.body;
  try {
    if (!name || !address) {
      return res.status(400).json({
        success: false,
        message: req.t("common.required_fields"),
      });
    }
    const isWorkLocationExist = await WorkLocation.findById(id);
    if (!isWorkLocationExist) {
      return res.status(404).json({
        success: false,
        message: req.t("work_location.not_found_error"),
      });
    }
    const updatedWorkLocation = await WorkLocation.findByIdAndUpdate(
      id,
      {
        name,
        address,
      },
      { new: true },
    );
    if (!updatedWorkLocation) {
      return res.status(400).json({
        success: false,
        message: req.t("work_location.update_error"),
      });
    }
    res.status(200).json({
      success: true,
      message: req.t("work_location.update_success"),
      workLocation: updatedWorkLocation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: req.t("common.server_error"),
    });
  }
};

//* DELETE WORK LOCATION
export const deleteWorkLocation = async (req, res) => {
  const { id } = req.params;
  try {
    const accountCount = await Auth.countDocuments({ workLocationId: id });
    const patrolPointCount = await PatrolPoint.countDocuments({
      workLocationId: id,
    });
    if (accountCount > 0 && patrolPointCount > 0) {
      return res.status(400).json({
        success: false,
        message: req.t("work_location.user_exist_error"),
      });
    }
    const isWorkLocationExist = await WorkLocation.findById(id);
    if (!isWorkLocationExist) {
      return res.status(404).json({
        success: false,
        message: req.t("work_location.not_found_error"),
      });
    }
    await WorkLocation.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: req.t("work_location.delete_success"),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: req.t("common.server_error"),
    });
  }
};
