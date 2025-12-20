import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5003/api/"
    : "/api/";

axios.defaults.withCredentials = true;

export const useAuthStore = create((set, get) => ({
  user: null,
  users: [],
  userDetail: null,
  isAuthenticated: false,
  error: null,
  isLoading: false,
  isCheckingAuth: true,
  message: null,
  //** SIGN UP
  signup: async (
    email,
    password,
    firstName,
    middleName,
    lastName,
    position
  ) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}auth/signup`, {
        email,
        password,
        firstName,
        middleName,
        lastName,
        position,
      });
      set({
        // user: response.data.user,
        // isAuthenticated: false,
        error: response.data.message,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error signing up",
        isLoading: false,
      });
      throw error;
    }
  },
  //** LOGIN
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}auth/login`, {
        email,
        password,
      });
      set({
        isAuthenticated: true,
        user: response.data.user,
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
        user: null,
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
        user: response.data.user,
        isAuthenticated: true,
        isCheckingAuth: false,
      });
    } catch (error) {
      set({ error: null, isCheckingAuth: false, isAuthenticated: false });
    }
  },
  //** FETCH ALL
  fetchAllUsers: async () => {
    set({ isLoading: false, error: null });
    try {
      const response = await axios.get(`${API_URL}auth/users`);
      set({ isLoading: false, users: response.data.users });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error adding new ingredients";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },

  fetchAllSecurities: async () => {
    set({ isLoading: false, error: null });
    try {
      const response = await axios.get(`${API_URL}auth/users`);
      const securityUsers = response.data.users.filter(
        (user) => user.position === "security"
      );
      set({ isLoading: false, users: securityUsers });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error adding new ingredients";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },
  //** FETCH Detail
  fetchUserDetail: async (id) => {
    set({ isLoading: false, error: null });
    try {
      const response = await axios.get(`${API_URL}auth/user/${id}`);
      set({ isLoading: false, userDetail: response.data.user });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error adding new ingredients";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },
  //** UPDATE USER
  updateUser: async (id, email, firstName, middleName, lastName) => {
    set({ isLoading: false, error: null });
    try {
      const response = await axios.put(`${API_URL}auth/update/${id}`, {
        email,
        firstName,
        middleName,
        lastName,
      });
      set({ isLoading: false, userDetail: response.data.user });
      await get().fetchAllUsers();
      // toast.success("Success update user detail");
    } catch (error) {
      set({ error: "Error logging out", isLoading: false });
      throw error;
    }
  },
  //** DELETE USER
  deleteUser: async (id) => {
    set({ isLoading: false, error: null });
    try {
      const response = await axios.delete(`${API_URL}auth/delete/${id}`);
      set({ isLoading: false, userDetail: response.data.user });
      await get().fetchAllUsers();
      toast.success("Success delete account");
    } catch (error) {
      set({ error: "Error logging out", isLoading: false });
      throw error;
    }
  },
}));
