import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5003/api/"
    : "/api/";

axios.defaults.withCredentials = true;

export const useUserStore = create((set, get) => ({
  user: null,
  users: [],
  userDetail: null,
  error: null,
  isLoading: false,
  message: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}user/all`);
      set({ users: response.data.users, isLoading: false });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error fetching users";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },
  fetchUserDetail: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}user/${id}`);
      set({ userDetail: response.data.user, isLoading: false });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error fetching user detail";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },
  createUser: async (firstName, middleName, lastName) => {
    const position = "security";
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}user/create`, {
        firstName,
        middleName,
        lastName,
        position,
      });
      set({ message: response.data.message, isLoading: false });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error creating user";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },
  updateUser: async (id, firstName, middleName, lastName, position) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}user/update/${id}`, {
        firstName,
        middleName,
        lastName,
        position,
      });
      set({ message: response.data.message, isLoading: false });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error updating user";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },

  deleteUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.delete(`${API_URL}user/delete/${id}`);
      set({ message: response.data.message, isLoading: false });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error deleting users";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },
}));
