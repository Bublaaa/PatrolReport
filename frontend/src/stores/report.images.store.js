import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5003/api/"
    : "/api/";

axios.defaults.withCredentials = true;

export const useReportImagesStore = create((set, get) => ({
  reportImages: [],
  error: null,
  isLoading: false,
  message: null,

  fetchReportImages: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}report-images/get`);
      set({ reportImages: response.data.reportImages, isLoading: false });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error fetching report images";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },

  fetchReportImagesByReportId: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}report-images/${id}`);
      set({ reportImages: response.data.reportImages, isLoading: false });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error fetching report images";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },

  createReportImages: async (reportId, images) => {
    set({ isLoading: true, error: null });

    try {
      if (!reportId || !Array.isArray(images) || images.length === 0) {
        const errorMessage = "Invalid report images payload";
        set({
          error: errorMessage,
          isLoading: false,
        });
        toast.error(errorMessage);
        return;
      }

      await Promise.all(
        images.map((img) =>
          axios.post(`${API_URL}report-images/create`, {
            reportId,
            fileName: img.fileName,
            localKey: img.localKey,
          }),
        ),
      );

      set({ isLoading: false });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error creating report images";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },

  updateReportImages: async (id, reportId, fileName, localKey) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}report-images/update/${id}`, {
        reportId,
        fileName,
        localKey,
      });
      set({ message: response.data.message, isLoading: false });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error updating report images";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },

  deleteReportImages: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.delete(
        `${API_URL}report-images/delete/${id}`,
      );
      set({ message: response.data.message, isLoading: false });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error deleting report images";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },
}));
