import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5003/api/"
    : "/api/";

axios.defaults.withCredentials = true;

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
      const response = await axios.get(`${API_URL}work-location/get`);
      set({ workLocations: response.data.workLocations, isLoading: false });
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
  fetchWorkLocations: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}work-location/${id}`);
      set({ workLocation: response.data.workLocation, isLoading: false });
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
  fetchWorkLocations: async (name, address) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}work-location/create`, {
        name,
        address,
      });
      set({ message: response.data.message, isLoading: false });
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
  fetchWorkLocations: async (id, name, address) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}work-location/update/${id}`, {
        name,
        address,
      });
      set({ message: response.data.message, isLoading: false });
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
      const response = await axios.delete(
        `${API_URL}work-location/delete/${id}`,
      );
      set({ message: response.data.message, isLoading: false });
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
