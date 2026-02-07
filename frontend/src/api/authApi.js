import axiosClient from "./axiosClient";

/**
 * Authentication API Service
 * Centralized auth-related API calls
 */

export const authApi = {
  /**
   * Login (Step 1 - send credentials)
   */
  login: (credentials) => {
    return axiosClient.post("/auth/login", credentials);
  },

  /**
   * Verify OTP (Step 2 - receive final JWT token)
   */
  verifyOtp: (otpData) => {
    return axiosClient.post("/auth/verify-otp", otpData);
  },

  /**
   * Admin Signup (Create new admin)
   */
  adminSignup: (adminData) => {
    return axiosClient.post("/admin/signup", adminData);
  },
};
