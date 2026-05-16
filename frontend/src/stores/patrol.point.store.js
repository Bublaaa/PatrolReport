import { create } from "zustand";
import axios from "../utils/axios";
import toast from "react-hot-toast";

export const usePatrolPointStore = create((set, get) => ({
  patrolPoints: [],
  patrolPointDetail: null,
  qrCode: null,
  error: null,
  isLoading: false,
  message: null,

  fetchPatrolPoints: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get("patrol-point/get");
      set({
        patrolPoints: response.data.patrolPoints,
        message: response.data.message,
        isLoading: false,
      });
      toast.success(response.data.message);
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
      const response = await axios.get(`patrol-point/${id}`);
      set({
        patrolPointDetail: response.data.patrolPoint,
        message: response.data.message,
        isLoading: false,
      });
      toast.success(response.data.message);
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

  createPatrolPoint: async (name, latitude, longitude, workLocationId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post("patrol-point/create", {
        name,
        latitude,
        longitude,
        workLocationId,
      });
      set({ message: response.data.message, isLoading: false });
      toast.success(response.data.message);
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

  updatePatrolPoint: async (id, name, latitude, longitude, workLocationId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`patrol-point/update/${id}`, {
        name,
        latitude,
        longitude,
        workLocationId,
      });
      set({ message: response.data.message, isLoading: false });
      toast.success(response.data.message);
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
      const response = await axios.delete(`patrol-point/delete/${id}`);
      set({ message: response.data.message, isLoading: false });
      toast.success(response.data.message);
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

  generateQRCode: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post("patrol-point/generate-qr", {
        id,
      });
      set({
        qrCode: response.data.qrCode,
        message: response.data.message,
        isLoading: false,
      });
      // toast.success(response.data.message);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error generating QR code";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
      return null;
    }
  },
}));
