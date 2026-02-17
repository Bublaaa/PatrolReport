import { Auth } from "../models/Auth.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/generateTokenAndSetCookie.js";

//* LOGIN
export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }
    const auth = await Auth.findOne({ username }).populate(
      "workLocationId",
      "name address",
    );

    if (!auth) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const isPasswordValid = await bcrypt.compare(password, auth.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    generateTokenAndSetCookie(res, auth._id);
    auth.lastLogin = new Date();
    await auth.save();

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: auth,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

//* LOGOUT
export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

//* CHECK AUTH
export const checkAuth = async (req, res) => {
  console.log("CHECK AUTH DEBUG:", {
    id: req._id,
    cookies: req.cookies,
    authHeader: req.headers.authorization,
  });

  try {
    const auth = await Auth.findById(req._id).select("-password");
    if (!auth) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      auth,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//* CREATE ACCOUNT
export const createAuth = async (req, res) => {
  const {
    username,
    password,
    firstName,
    middleName,
    lastName,
    workLocationId,
    position,
  } = req.body;
  try {
    if (
      !username ||
      !password ||
      !firstName ||
      !lastName ||
      !workLocationId ||
      !position
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const isAlreadyExist = await Auth.findOne({ username });
    if (isAlreadyExist) {
      return res
        .status(400)
        .json({ success: false, message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAuth = new Auth({
      username,
      password: hashedPassword,
      firstName: firstName,
      middleName: middleName,
      lastName: lastName,
      workLocationId: workLocationId,
      position: position,
    });
    await newAuth.save();
    res.status(201).json({
      success: true,
      message: "Auth created successfully",
      auth: newAuth,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

//* UPDATE ACCOUNT - FOR USER
export const updateProfile = async (req, res) => {
  const { id } = req.params;
  const {
    username,
    oldPassword,
    newPassword,
    firstName,
    middleName,
    lastName,
  } = req.body;
  try {
    if (!username || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const auth = await Auth.findById(id);
    if (!auth) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    const updateData = {
      username,
      firstName,
      middleName,
      lastName,
    };

    if (newPassword) {
      if (!oldPassword) {
        return res.status(400).json({
          success: false,
          message: "Old password is required",
        });
      }

      const isPasswordValid = await bcrypt.compare(oldPassword, auth.password);

      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid old password",
        });
      }

      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedAccount = await Auth.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      auth: updatedAccount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//* UPDATE ACCOUNT - FOR ADMIN
export const updateAuth = async (req, res) => {
  const { id } = req.params;
  const {
    username,
    password,
    firstName,
    middleName,
    lastName,
    workLocationId,
    position,
  } = req.body;

  try {
    if (!username || !firstName || !lastName || !workLocationId || !position) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    const auth = await Auth.findById(id);
    if (!auth) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (username && username !== auth.username) {
      const usernameExists = await Auth.exists({
        username,
        _id: { $ne: id },
      });

      if (usernameExists) {
        return res.status(400).json({
          success: false,
          message: "Username already exists",
        });
      }
    }

    const adminCount = await Auth.countDocuments({ position: "admin" });

    const isLastAdmin =
      adminCount === 1 && auth.position === "admin" && position !== "admin";

    if (isLastAdmin) {
      return res.status(400).json({
        success: false,
        message: "Cannot change the last admin account",
      });
    }

    const updateData = {
      username,
      firstName,
      middleName,
      lastName,
      position,
      workLocationId,
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await Auth.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      auth: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//* DELETE ACCOUNT
export const deleteAuth = async (req, res) => {
  const { id } = req.params;
  try {
    const auth = await Auth.findById(id);
    if (!auth) {
      return res
        .status(404)
        .json({ success: false, message: "Auth not found" });
    }
    const adminCount = await Auth.countDocuments({ position: "admin" });

    if (adminCount <= 1 && auth.position === "admin") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete the last admin account",
      });
    }

    await Auth.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Auth deleted successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

//*  GET ALL THE ACCOUNT
export const getAllAuths = async (req, res) => {
  try {
    const auths = await Auth.find()
      .populate("workLocationId", "name address")
      .select("-password");
    res.status(200).json({
      success: true,
      auths,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// * GET ACCOUNT DETAIL
export const getAuthDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const authDetail = await Auth.findById(id).select("-password");
    if (!authDetail) {
      res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Account detail fetched successfully",
      authDetail: authDetail,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
