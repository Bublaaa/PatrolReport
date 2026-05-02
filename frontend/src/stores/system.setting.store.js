import { create } from "zustand";
import axios from "../utils/axios";
import toast from "react-hot-toast";

export const useSystemSettingStore = create((set, get) => ({
  systemSettings: [],
  systemSettingDetail: null,
  error: null,
  isLoading: false,
  message: null,

  fetchAllSystemSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`system-setting/get`);
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
      const response = await axios.get(`system-setting/get-drive-id`);
      set({ systemSettingDetail: response.data.folderId, isLoading: false });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error fetching drive folder id";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },
  updateDriveFolderId: async (link) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`system-setting/update-drive-id`, {
        link,
      });
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
      const response = await axios.post(`system-setting/create-drive-id`, {
        link,
      });
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
