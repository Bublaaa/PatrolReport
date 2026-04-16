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
        message: req.t("common.required_fields"),
      });
    }
    const auth = await Auth.findOne({ username }).populate(
      "workLocationId",
      "name address",
    );

    if (!auth) {
      return res.status(400).json({
        success: false,
        message: req.t("auth.invalid_credentials"),
      });
    }
    const isPasswordValid = await bcrypt.compare(password, auth.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: req.t("auth.invalid_credentials"),
      });
    }
    generateTokenAndSetCookie(res, auth._id);
    auth.lastLogin = new Date();
    await auth.save();

    res.status(200).json({
      success: true,
      message: req.t("auth.login_success"),
      user: auth,
    });
  } catch (error) {
    res
      .status(400)
      .json({ success: false, message: req.t("common.server_error") });
  }
};

//* LOGOUT
export const logout = async (req, res) => {
  res.clearCookie("token");
  res
    .status(200)
    .json({ success: true, message: req.t("auth.logout_success") });
};

//* CHECK AUTH
export const checkAuth = async (req, res) => {
  // console.log("CHECK AUTH DEBUG:", {
  //   id: req._id,
  //   cookies: req.cookies,
  //   authHeader: req.headers.authorization,
  // });

  try {
    const auth = await Auth.findById(req._id).select("-password");
    if (!auth) {
      return res.status(404).json({
        success: false,
        message: req.t("auth.user_not_found"),
      });
    }

    res.status(200).json({
      success: true,
      auth,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: req.t("common.server_error"),
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
        .json({ success: false, message: req.t("common.required_fields") });
    }
    const isAlreadyExist = await Auth.findOne({ username });
    if (isAlreadyExist) {
      return res
        .status(400)
        .json({ success: false, message: req.t("auth.user_already_exists") });
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
      message: req.t("auth.create_success"),
      auth: newAuth,
    });
  } catch (error) {
    res
      .status(400)
      .json({ success: false, message: req.t("common.server_error") });
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
        message: req.t("common.required_fields"),
      });
    }

    const auth = await Auth.findById(id);
    if (!auth) {
      return res.status(404).json({
        success: false,
        message: req.t("auth.user_not_found"),
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
          message: req.t("auth.old_password_required"),
        });
      }

      const isPasswordValid = await bcrypt.compare(oldPassword, auth.password);

      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: req.t("auth.invalid_old_password"),
        });
      }

      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedAccount = await Auth.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      message: req.t("auth.update_success"),
      auth: updatedAccount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: req.t("common.server_error"),
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
        message: req.t("common.required_fields"),
      });
    }

    const auth = await Auth.findById(id);
    if (!auth) {
      return res.status(404).json({
        success: false,
        message: req.t("auth.user_not_found"),
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
          message: req.t("auth.user_already_exists"),
        });
      }
    }

    const adminCount = await Auth.countDocuments({ position: "admin" });

    const isLastAdmin =
      adminCount === 1 && auth.position === "admin" && position !== "admin";

    if (isLastAdmin) {
      return res.status(400).json({
        success: false,
        message: req.t("auth.last_admin_error"),
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
      message: req.t("auth.update_success"),
      auth: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: req.t("common.server_error"),
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
        .json({ success: false, message: req.t("auth.user_not_found") });
    }
    const adminCount = await Auth.countDocuments({ position: "admin" });

    if (adminCount <= 1 && auth.position === "admin") {
      return res.status(400).json({
        success: false,
        message: req.t("auth.last_admin_error"),
      });
    }

    await Auth.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: req.t("auth.delete_success"),
    });
  } catch (error) {
    res
      .status(400)
      .json({ success: false, message: req.t("common.server_error") });
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
      message: req.t("auth.get_all_auth_success"),
      auths,
    });
  } catch (error) {
    res
      .status(400)
      .json({ success: false, message: req.t("common.server_error") });
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
        message: req.t("auth.user_not_found"),
      });
    }
    res.status(200).json({
      success: true,
      message: req.t("auth.get_detail_success"),
      authDetail: authDetail,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: req.t("common.server_error") });
  }
};
