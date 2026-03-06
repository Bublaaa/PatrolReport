import { User } from "../models/User.js";
import { Report } from "../models/Report.js";
import { Auth } from "../models/Auth.js";

export const getAllUser = async (req, res) => {
  try {
    const users = await User.find().populate("workLocationId", "name address");
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "No user found" });
    }
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserDetail = async (req, res) => {
  const { id } = req.params;
  try {
    // const user = await User.findById(id).select("-password");
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createUser = async (req, res) => {
  const { firstName, middleName, lastName, position, workLocationId } =
    req.body;
  try {
    if (!firstName || !lastName || !position || !workLocationId) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const newUser = new User({
      firstName,
      middleName,
      lastName,
      position,
      workLocationId,
    });
    await newUser.save();
    res.status(201).json({
      success: true,
      message: "Successfully created user account",
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { firstName, middleName, lastName, position, workLocationId } =
    req.body;
  try {
    if (!position || !firstName || !lastName || !workLocationId) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const isExist = await User.findById(id);
    if (!isExist) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const updatedUser = await User.findByIdAndUpdate(id, {
      firstName,
      middleName,
      lastName,
      position,
      workLocationId,
    });
    res.status(200).json({
      success: true,
      message: "Successfully updated account",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const isUserExist = await User.findById(id);
    if (!isUserExist) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const reportCount = await Report.countDocuments({ userId: id });
    if (reportCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Schedule data for that user account still exist",
      });
    }
    const isAdmin = await Auth.findOne({ userId: id });
    if (isAdmin) {
      return res.status(400).json({
        success: false,
        message: "User is still registered as admin",
      });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
