import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:5000/api",
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
  (error) => Promise.reject(error)
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
  }
);

export default axiosClient;
