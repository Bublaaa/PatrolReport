import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5003/api/"
    : "/api/";

axios.defaults.withCredentials = true;

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// attach language header automatically
axiosInstance.interceptors.request.use((config) => {
  const lang = localStorage.getItem("lang") || "id";
  config.headers["x-lang"] = lang;
  return config;
});

export default axiosInstance;
