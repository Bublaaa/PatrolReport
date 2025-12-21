import { User } from "../models/User.js";
import { Auth } from "../models/Auth.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/generateTokenAndSetCookie.js";

export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const auth = await Auth.findOne({ username });
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
    generateTokenAndSetCookie(res, auth.userId);
    const user = await User.findById(auth.userId);
    auth.lastLogin = new Date();
    await auth.save();

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: user,
    });
  } catch (error) {
    console.log("Error in login ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const checkAuth = async (req, res) => {
  console.log("CHECK AUTH DEBUG:", {
    userId: req.userId,
    cookies: req.cookies,
    authHeader: req.headers.authorization,
  });

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log("Error in check auth", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createAuth = async (req, res) => {
  const { username, password, userId } = req.body;
  try {
    if (!username || !password || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const existingAuth = await Auth.findOne({ username });
    if (existingAuth) {
      return res
        .status(400)
        .json({ success: false, message: "Username already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAuth = new Auth({
      username,
      password: hashedPassword,
      userId,
    });
    await newAuth.save();
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateAuth = async (req, res) => {
  const { id } = req.params;
  const { username, password, userId } = req.body;
  try {
    const auth = await Auth.findById(id);
    if (!auth) {
      return res
        .status(404)
        .json({ success: false, message: "Auth not found" });
    }
    if (username) auth.username = username;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      auth.password = hashedPassword;
    }
    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      auth.userId = userId;
    }
    await auth.save();
    res.status(200).json({
      success: true,
      message: "Auth updated successfully",
      auth,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteAuth = async (req, res) => {
  const { id } = req.params;
  try {
    const auth = await Auth.findById(id);
    if (!auth) {
      return res
        .status(404)
        .json({ success: false, message: "Auth not found" });
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

export const getAllAuths = async (req, res) => {
  try {
    const auths = await Auth.find().select("-password");
    res.status(200).json({
      success: true,
      auths,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
