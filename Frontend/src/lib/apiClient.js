import axios from "axios";
import { getApiUrl } from "../config/api.js";

// Create Axios instance
const apiClient = axios.create({
  baseURL: getApiUrl(""),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message;

    // Handle 401 - Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      window.location.href = "/";
    }

    return Promise.reject({
      status: error.response?.status,
      message,
      data: error.response?.data,
    });
  }
);

export default apiClient;
