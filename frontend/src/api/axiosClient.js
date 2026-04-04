import axios from "axios";

// Use environment variable for production, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const axiosClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Handle responses
axiosClient.interceptors.response.use(
  (response) => {
    // keep full axios response, vehicleApi will use response.data
    return response;
  },
  (error) => {
    // optionally log server message
    if (error.response) {
      console.error("API error:", error.response.status, error.response.data);
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
