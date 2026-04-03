import axiosClient from "./axiosClient";

export const adminApi = {
  // Get current admin profile
  getProfile: () => axiosClient.get("/auth/profile"),

  // Update admin profile
  updateProfile: (data) => axiosClient.put("/auth/profile", data),

  // Change password
  changePassword: (data) => axiosClient.post("/auth/change-password", data),
};
