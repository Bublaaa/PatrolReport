import { create } from "zustand";
import axios from "../utils/axios";
import toast from "react-hot-toast";

export const useWorkLocationStore = create((set, get) => ({
  workLocations: [],
  workLocation: null,
  error: null,
  isLoading: false,
  message: null,

  // * FETCH ALL WORK LOCATIONS
  fetchWorkLocations: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`work-location/get`);
      set({
        workLocations: response.data.workLocations,
        message: response.data.message,
        isLoading: false,
      });
      toast.success(response.data.message);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error fetching work locations";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },

  // * FETCH WORK LOCATION DETAIL
  fetchWorkLocationDetail: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`work-location/${id}`);
      set({
        workLocation: response.data.workLocation,
        message: response.data.message,
        isLoading: false,
      });
      toast.success(response.data.message);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error fetching work locations";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },

  // * CERATE WORK LOCATION
  createWorkLocation: async (name, address) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`work-location/create`, {
        name,
        address,
      });
      set({ message: response.data.message, isLoading: false });
      toast.success(response.data.message);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error fetching work locations";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },

  // * UPDATE WORK LOCATION
  updateWorkLocation: async (id, name, address) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`work-location/update/${id}`, {
        name,
        address,
      });
      set({ message: response.data.message, isLoading: false });
      toast.success(response.data.message);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error fetching work locations";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },

  // * DELETE WORK LOCATION
  deleteWorkLocation: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.delete(`work-location/delete/${id}`);
      set({ message: response.data.message, isLoading: false });
      toast.success(response.data.message);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error fetching work locations";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },
}));
