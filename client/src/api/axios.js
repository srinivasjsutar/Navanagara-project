import axios from "axios";

// Base URL from environment variable or default to production backend
const API_BASE_URL = process.env.REACT_APP_API_BASE || "http://localhost:3001";

// Create axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor - Add auth token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("adminToken") ||
      localStorage.getItem("superAdminToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request for debugging (remove in production)
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  },
);

// Response interceptor - Handle common errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful response for debugging (remove in production)
    console.log(
      `API Response: ${response.config.url} - Status: ${response.status}`,
    );
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      if (status === 401) {
        console.error("Authentication failed. Redirecting to login...");
        if (localStorage.getItem("superAdminToken")) {
          localStorage.removeItem("superAdminToken");
          localStorage.removeItem("superAdminData");
          window.location.href = "/superadmin";
        } else {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminData");
          window.location.href = "/adminlogin";
        }
      } else if (status === 403) {
        // Forbidden
        console.error("Access forbidden:", data.message);
      } else if (status === 404) {
        // Not found
        console.error("Resource not found:", error.config.url);
      } else if (status === 500) {
        // Server error
        console.error("Server error:", data.message);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error("No response from server. Please check your connection.");
    } else {
      // Something else happened
      console.error("Request error:", error.message);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
