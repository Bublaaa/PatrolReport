import { PatrolPoint } from "../models/PatrolPoint.js";
import { Report } from "../models/Report.js";
import QRCode from "qrcode";

// * * GET ALL
export const getAllPatrolPoints = async (req, res) => {
  try {
    const patrolPoints = await PatrolPoint.find().sort({ name: 1 });
    if (patrolPoints.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No patrol points found",
        patrolPoints: [],
      });
    }
    res.status(200).json({
      success: true,
      message: "Success get all patrol points",
      patrolPoints: patrolPoints,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// * * GET DETAIL
export const getPatrolPointsDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const patrolPoint = await PatrolPoint.findById(id);
    if (!patrolPoint) {
      return res.status(404).json({
        success: false,
        message: "Patrol point not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Success get patrol point detail",
      patrolPoint: patrolPoint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// * * CREATE
export const createPatrolPoint = async (req, res) => {
  let { name, latitude, longitude } = req.body;

  try {
    if (!name || latitude === undefined || longitude === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "Name and Coordinates are required" });
    }

    name = name.toLowerCase();

    const isAlreadyExist = await PatrolPoint.findOne({ name });
    if (isAlreadyExist) {
      return res
        .status(400)
        .json({ success: false, message: "PatrolPoint already exist" });
    }

    const newPatrolPoint = new PatrolPoint({
      name,
      latitude,
      longitude,
      barcode: "",
    });

    newPatrolPoint.barcode = newPatrolPoint._id.toString();

    await newPatrolPoint.save();

    res.status(201).json({
      success: true,
      message: "New patrol point created",
      patrolPoint: newPatrolPoint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// * * UPDATE
export const updatePatrolPoint = async (req, res) => {
  const { id } = req.params;
  let { name, latitude, longitude } = req.body;

  try {
    if (!name || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name and Coordinates are required",
      });
    }

    const isPatrolPointExist = await PatrolPoint.findById(id);
    if (!isPatrolPointExist) {
      return res.status(404).json({
        success: false,
        message: "Patrol point not found",
      });
    }

    const updatedPatrolPoint = await PatrolPoint.findByIdAndUpdate(
      id,
      {
        name: name.toLowerCase(),
        latitude,
        longitude,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Patrol point updated successfully",
      patrolPoint: updatedPatrolPoint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// * * DELETE
export const deletePatrolPoint = async (req, res) => {
  const { id } = req.params;
  try {
    const isPatrolPointExist = await PatrolPoint.findById(id);
    if (!isPatrolPointExist) {
      return res
        .status(404)
        .json({ success: false, message: "PatrolPoint not found" });
    }
    const reportCount = await Report.countDocuments({ patrolPointId: id });
    if (reportCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Report data for that patrol point exist",
      });
    }
    await PatrolPoint.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "PatrolPoint deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generatePatrolPointBarcode = async (req, res) => {
  const API_URL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:5003/api/"
      : "/api/";
  const { id } = req.body;
  try {
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Patrol Point ID is required" });
    }
    const patrolPointUrl = `${API_URL}report/create/${id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(patrolPointUrl);

    if (!qrCodeDataUrl) {
      return res
        .status(400)
        .json({ success: false, message: "Error generating QR" });
    }

    return res.status(200).json({
      success: true,
      message: "Success generate QR code",
      qrCode: qrCodeDataUrl,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate QR Code",
      error: error.message,
    });
  }
};
