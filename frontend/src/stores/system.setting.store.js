import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5003/api/"
    : "/api/";

axios.defaults.withCredentials = true;

export const useSystemSettingStore = create((set, get) => ({
  systemSettings: [],
  systemSettingDetail: null,
  error: null,
  isLoading: false,
  message: null,

  fetchAllSystemSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}system-setting/get`);
      set({ systemSettings: response.data.systemSettings, isLoading: false });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error fetching system settings";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },
  fetchDriveFolderId: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}system-setting/get-drive-id`);
      set({ systemSettingDetail: response.data.folderId, isLoading: false });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error fetching drive folder id";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },
  updateDriveFolderId: async (link) => {
    console.log("Updating drive folder ID with link:", link);
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(
        `${API_URL}system-setting/update-drive-id`,
        {
          link,
        }
      );
      set({ message: response.data.message, isLoading: false });
      toast.success("Drive folder ID updated successfully");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error update drive folder id";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },
  createDriveFolderId: async (link) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        `${API_URL}system-setting/create-drive-id`,
        {
          link,
        }
      );
      set({ message: response.data.message, isLoading: false });
      toast.success("Drive folder ID created successfully");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error create folder id";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },
}));
