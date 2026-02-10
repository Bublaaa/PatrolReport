import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5003/api/"
    : "/api/";

axios.defaults.withCredentials = true;

export const useAuthStore = create((set, get) => ({
  users: [],
  userDetail: null,
  isAuthenticated: false,
  error: null,
  isLoading: false,
  isCheckingAuth: true,
  message: null,
  //** LOGIN
  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}auth/login`, {
        username,
        password,
      });
      set({
        isAuthenticated: true,
        userDetail: response.data.user,
        error: null,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error logging in",
        isLoading: false,
      });
      throw error;
    }
  },
  //** LOGOUT
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(`${API_URL}auth/logout`);
      set({
        userDetail: null,
        isAuthenticated: false,
        error: null,
        isLoading: false,
      });
    } catch (error) {
      set({ error: "Error logging out", isLoading: false });
      throw error;
    }
  },
  //** CHECK AUTHENTICATION
  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null });
    try {
      const response = await axios.get(`${API_URL}auth/check-auth`);
      set({
        userDetail: response.data.auth,
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
      const response = await axios.get(`${API_URL}auth/get`);
      set({ users: response.data.auths, isLoading: false });
      toast.success("All accounts fetched successfully");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error fetching auth";
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
      const response = await axios.get(`${API_URL}auth/get/${id}`);
      set({ userDetail: response.data.authDetail, isLoading: false });
      toast.success("Account fetched successfully");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error fetching auth";
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
      const response = await axios.post(`${API_URL}auth/create`, {
        username,
        password,
        firstName,
        middleName,
        lastName,
        workLocationId,
        position,
      });
      set({ isLoading: false });
      toast.success("Auth created successfully");
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error creating auth";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
      throw error;
    }
  },

  // * UPDATE ACCOUNT
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
      const response = await axios.put(`${API_URL}auth/update/${id}`, {
        username,
        firstName,
        middleName,
        lastName,
        workLocationId,
        position,
      });
      set({ isLoading: false });
      toast.success("Auth updated successfully");
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
      const response = await axios.delete(`${API_URL}auth/delete/${id}`);
      set({ isLoading: false });
      toast.success("Auth deleted successfully");
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
