import axiosClient from "./axiosClient";

export const vehicleApi = {
  // Get all vehicles (Public)
  getAll: () => {
    return axiosClient.get("/vehicles");
  },

  // Get vehicle by ID (Public)
  getById: (id) => {
    return axiosClient.get(`/vehicles/${id}`);
  },

  // Create vehicle (Admin only)
  create: (vehicleData) => {
    return axiosClient.post("/vehicles", vehicleData);
  },

  // Update vehicle (Admin only)
  update: (id, vehicleData) => {
    return axiosClient.put(`/vehicles/${id}`, vehicleData);
  },

  // Delete vehicle (Admin only)
  delete: (id) => {
    return axiosClient.delete(`/vehicles/${id}`);
  },
};
