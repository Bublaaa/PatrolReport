import { create } from "zustand";
import axios from "../utils/axios";
import toast from "react-hot-toast";

export const useAuthStore = create((set, get) => ({
  users: [],
  userDetail: null,
  loggedInUserDetail: null,
  isAuthenticated: false,
  error: null,
  isLoading: false,
  isCheckingAuth: true,
  message: null,
  //** LOGIN
  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post("auth/login", {
        username,
        password,
      });
      set({
        isAuthenticated: true,
        loggedInUserDetail: response.data.user,
        message: response.data.message,
        error: null,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message,
        isLoading: false,
      });
      throw error;
    }
  },
  //** LOGOUT
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post("auth/logout");
      set({
        loggedInUserDetail: null,
        userDetail: null,
        isAuthenticated: false,
        message: response.data.message,
        error: null,
        isLoading: false,
      });
    } catch (error) {
      console.log("Logout error: ", error);
      set({ error: "Error logging out", isLoading: false });
      throw error;
    }
  },
  //** CHECK AUTHENTICATION
  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null });
    try {
      const response = await axios.get("auth/check-auth");
      set({
        loggedInUserDetail: response.data.auth,
        isAuthenticated: true,
        isCheckingAuth: false,
      });
    } catch (error) {
      set({ error: null, isCheckingAuth: false, isAuthenticated: false });
    }
  },

  //* FETCH ALL ACCOUNT
  getAllAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get("auth/get");
      set({
        users: response.data.auths,
        isLoading: false,
        message: response.data.message,
      });
      toast.success(response.data.message);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || response.data.message;
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },

  //* FETCH ACCOUNT DETAIL
  getAuthDetail: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`auth/get/${id}`);
      set({
        userDetail: response.data.authDetail,
        message: response.data.message,
        isLoading: false,
      });
      toast.success(response.data.message);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        response.data.message ||
        "Error fetching auth";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },

  // * CREATE ACCOUNT
  createAuth: async (
    username,
    password,
    firstName,
    middleName,
    lastName,
    workLocationId,
    position,
  ) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post("auth/create", {
        username,
        password,
        firstName,
        middleName,
        lastName,
        workLocationId,
        position,
      });
      set({ isLoading: false });
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || response.data.message;
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
      throw error;
    }
  },

  // * UPDATE ACCOUNT - ADMIN
  updateAuth: async (
    id,
    username,
    firstName,
    middleName,
    lastName,
    position,
    workLocationId,
  ) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`auth/update/${id}`, {
        username,
        firstName,
        middleName,
        lastName,
        workLocationId,
        position,
      });
      set({ message: response.data.message, isLoading: false });
      toast.success(response.data.message);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error updating auth";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },

  // * UPDATE ACCOUNT - USER
  updateProfile: async (
    id,
    username,
    firstName,
    middleName,
    lastName,
    oldPassword,
    newPassword,
  ) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`auth/profile/update/${id}`, {
        username,
        oldPassword,
        newPassword,
        firstName,
        middleName,
        lastName,
      });
      set({
        isLoading: false,
        message: response.data.message,
        loggedInUserDetail: response.data.auth,
      });
      toast.success(response.data.message);
      return response.data.auth;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error updating auth";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },

  // * DELETE ACCOUNT
  deleteAuth: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.delete(`auth/delete/${id}`);
      set({ isLoading: false, message: response.data.message });
      toast.success(response.data.message);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error deleting auth";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },
}));
