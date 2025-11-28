import axiosClient from "./axiosClient";

export const authApi = {
  login: (credentials) => {
    return axiosClient.post("/auth/login", credentials);
  },

  verifyOtp: (otpData) => {
    return axiosClient.post("/auth/verify-otp", otpData);
  },
};
