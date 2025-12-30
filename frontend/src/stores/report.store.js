import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5003/api/"
    : "/api/";

axios.defaults.withCredentials = true;

export const useReportStore = create((set, get) => ({
  reports: [],
  reportDetail: null,
  error: null,
  isLoading: false,
  message: null,

  fetchReportDetailByDate: async (date) => {
    set({ isLoading: true, error: null });
    try {
      const formattedDate =
        typeof date === "string" ? date : date.toISOString().split("T")[0];

      const response = await axios.get(`${API_URL}report/${formattedDate}`);

      set({
        reports: response.data.reports || [],
        isLoading: false,
      });
      if (response.data.reports.length === 0) {
        toast.error("Report not found");
      } else {
        toast.success("Successfully fetch reports");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error fetching reports";
      set({ reports: [], error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

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

  createReport: async (userId, patrolPointId, report, latitude, longitude) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}report/create`, {
        userId,
        patrolPointId,
        report,
        latitude,
        longitude,
      });
      set({
        reportDetail: response.data.report,
        message: response.data.message,
        isLoading: false,
      });
      const createdReport = response.data.report;
      return createdReport;
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

  updateReport: async (id, report, userId, patrolPointId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}report/update/${id}`, {
        report,
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
