import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5003/api/"
    : "/api/";

axios.defaults.withCredentials = true;

export const usePatrolPointStore = create((set, get) => ({
  patrolPoints: [],
  patrolPointDetail: null,
  error: null,
  isLoading: false,
  message: null,

  fetchPatrolPoints: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}patrol-point/get`);
      set({ patrolPoints: response.data.patrolPoints, isLoading: false });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error fetching patrol points";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },

  fetchPatrolPointDetail: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}patrol-point/${id}`);
      set({ patrolPointDetail: response.data.patrolPoint, isLoading: false });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error fetching patrol point detail";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },

  createPatrolPoint: async (name, latitude, longitude) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}patrol-point/create`, {
        name,
        latitude,
        longitude,
      });
      set({ message: response.data.message, isLoading: false });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error creating patrol point";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },

  updatePatrolPoint: async (id, name, latitude, longitude) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}patrol-point/update/${id}`, {
        name,
        latitude,
        longitude,
      });
      set({ message: response.data.message, isLoading: false });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error updating patrol point";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },

  deletePatrolPoint: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.delete(
        `${API_URL}patrol-point/delete/${id}`
      );
      set({ message: response.data.message, isLoading: false });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error deleting patrol point";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },
}));
