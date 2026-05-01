import { PatrolPoint } from "../models/PatrolPoint.js";
import { Report } from "../models/Report.js";
import QRCode from "qrcode";

// * * GET ALL
export const getAllPatrolPoints = async (req, res) => {
  try {
    const patrolPoints = await PatrolPoint.find()
      .populate("workLocationId", "name address")
      .sort({ name: 1 });
    if (patrolPoints.length === 0) {
      return res.status(404).json({
        success: false,
        message: req.t("patrol_point.patrol_point_not_found"),
        patrolPoints: [],
      });
    }
    res.status(200).json({
      success: true,
      message: req.t("patrol_point.get_all_success"),
      patrolPoints: patrolPoints,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: req.t("common.server_error") });
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
        message: req.t,
      });
    }
    res.status(200).json({
      success: true,
      message: req.t("patrol_point.get_detail_success"),
      patrolPoint: patrolPoint,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: req.t("common.server_error") });
  }
};
// * * CREATE
export const createPatrolPoint = async (req, res) => {
  let { name, latitude, longitude, workLocationId } = req.body;

  try {
    if (
      !name ||
      latitude === undefined ||
      longitude === undefined ||
      !workLocationId
    ) {
      return res
        .status(400)
        .json({ success: false, message: req.t("common.required_fields") });
    }

    name = name.toLowerCase();

    const isAlreadyExist = await PatrolPoint.findOne({ name });
    if (isAlreadyExist) {
      return res.status(400).json({
        success: false,
        message: req.t("patrol_point.patrol_point_already_exists"),
      });
    }

    const newPatrolPoint = new PatrolPoint({
      name,
      latitude,
      longitude,
      barcode: "",
      workLocationId,
    });

    newPatrolPoint.barcode = newPatrolPoint._id.toString();

    await newPatrolPoint.save();

    res.status(201).json({
      success: true,
      message: req.t("patrol_point.create_success"),
      patrolPoint: newPatrolPoint,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: req.t("common.server_error") });
  }
};

// * * UPDATE
export const updatePatrolPoint = async (req, res) => {
  const { id } = req.params;
  let { name, latitude, longitude, workLocationId } = req.body;

  try {
    if (
      !name ||
      latitude === undefined ||
      longitude === undefined ||
      !workLocationId
    ) {
      return res.status(400).json({
        success: false,
        message: req.t("common.required_fields"),
      });
    }

    const isPatrolPointExist = await PatrolPoint.findById(id);
    if (!isPatrolPointExist) {
      return res.status(404).json({
        success: false,
        message: req.t("patrol_point.patrol_point_not_found"),
      });
    }

    const updatedPatrolPoint = await PatrolPoint.findByIdAndUpdate(
      id,
      {
        name: name.toLowerCase(),
        latitude,
        longitude,
        workLocationId,
      },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: req.t("patrol_point.update_success"),
      patrolPoint: updatedPatrolPoint,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: req.t("common.server_error") });
  }
};

// * * DELETE
export const deletePatrolPoint = async (req, res) => {
  const { id } = req.params;
  try {
    const isPatrolPointExist = await PatrolPoint.findById(id);
    if (!isPatrolPointExist) {
      return res.status(404).json({
        success: false,
        message: req.t("patrol_point.patrol_point_not_found"),
      });
    }
    const reportCount = await Report.countDocuments({ patrolPointId: id });
    if (reportCount > 0) {
      return res.status(400).json({
        success: false,
        message: req.t("patrol_point.report_exist_error"),
      });
    }
    await PatrolPoint.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: req.t("patrol_point.delete_success"),
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: req.t("common.server_error") });
  }
};

export const generatePatrolPointBarcode = async (req, res) => {
  const URL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:5173/"
      : process.env.CLIENT_URL;
  const { id } = req.body;
  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        message: req.t("patrol_point.patrol_point_id_required"),
      });
    }
    const patrolPointUrl = `${URL}security/report/create/${id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(patrolPointUrl);

    if (!qrCodeDataUrl) {
      return res.status(400).json({
        success: false,
        message: req.t("patrol_point.qr_code_generate_error"),
      });
    }

    return res.status(200).json({
      success: true,
      message: req.t("patrol_point.qr_code_generate_success"),
      qrCode: qrCodeDataUrl,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: req.t("patrol_point.qr_code_generate_error"),
      error: error.message,
    });
  }
};
