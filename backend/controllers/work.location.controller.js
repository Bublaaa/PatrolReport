import { WorkLocation } from "../models/WorkLocation.js";
//* GET ALL WORK LOCATIONS
export const getAllWorkLocations = async (req, res) => {
  try {
    const workLocations = await WorkLocation.find();
    res.status(200).json({
      success: true,
      workLocations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
        message: "Work location not found",
      });
    }
    res.status(200).json({
      success: true,
      workLocation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
        message: "Name and address are required",
      });
    }
    const newWorkLocation = await WorkLocation.create({ name, address });
    if (!newWorkLocation) {
      return res.status(400).json({
        success: false,
        message: "Failed to create work location",
      });
    }
    res.status(201).json({
      success: true,
      message: "Work location created successfully",
      workLocation: newWorkLocation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
        message: "Name and address are required",
      });
    }
    const isWorkLocationExist = await WorkLocation.findById(id);
    if (!isWorkLocationExist) {
      return res.status(404).json({
        success: false,
        message: "Work location not found",
      });
    }
    const updatedWorkLocation = await WorkLocation.findByIdAndUpdate(id, {
      name,
      address,
    });
    if (!updatedWorkLocation) {
      return res.status(400).json({
        success: false,
        message: "Failed to update work location",
      });
    }
    res.status(200).json({
      success: true,
      message: "Work location updated successfully",
      workLocation: updatedWorkLocation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//* DELETE WORK LOCATION
export const deleteWorkLocation = async (req, res) => {
  const { id } = req.params;
  try {
    const workLocationsCount = await WorkLocation.find();
    if (workLocationsCount.length === 1) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete the last work location",
      });
    }
    const isWorkLocationExist = await WorkLocation.findById(id);
    if (!isWorkLocationExist) {
      return res.status(404).json({
        success: false,
        message: "Work location not found",
      });
    }
    await WorkLocation.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Work location deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
