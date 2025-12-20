import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";
import { updateReport } from "../../../backend/controllers/report.controller";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5003/api/"
    : "/api/";

axios.defaults.withCredentials = true;

export const userReportStore = create((set, get) => ({
  reports: [],
  reportDetail: null,
  error: null,
  isLoading: false,
  message: null,

  fetchReports: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}report/get`);
      set({ reports: response.data.reports, isLoading: false });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error fetching reports";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },

  fetchReportDetail: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}report/${id}`);
      set({ reportDetail: response.data.report, isLoading: false });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error fetching report detail";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },

  createReport: async (
    userId,
    patrolPointId,
    report,
    imageUrl,
    latitude,
    longitude
  ) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}report/create`, {
        userId,
        patrolPointId,
        report,
        imageUrl,
        latitude,
        longitude,
      });
      set({ message: response.data.message, isLoading: false });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error creating report";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },

  updateReport: async (id, report, imageUrl, userId, patrolPointId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}report/update/${id}`, {
        report,
        imageUrl,
        userId,
        patrolPointId,
      });
      set({ message: response.data.message, isLoading: false });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error updating report";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },

  deleteReport: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.delete(`${API_URL}report/delete/${id}`);
      set({ message: response.data.message, isLoading: false });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error deleting report";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },
}));
