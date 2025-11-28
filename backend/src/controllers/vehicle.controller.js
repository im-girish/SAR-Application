import Vehicle from "../models/Vehicle.js";
import { successResponse, errorResponse } from "../utils/response.util.js";

// Create new vehicle (Admin only)
export const createVehicle = async (req, res) => {
  try {
    const vehicle = new Vehicle(req.body);
    await vehicle.save();

    return successResponse(res, vehicle, "Vehicle created successfully", 201);
  } catch (error) {
    console.error("Create vehicle error:", error);
    return errorResponse(res, "Failed to create vehicle", 500);
  }
};

// Get all vehicles (Public)
export const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    return successResponse(res, vehicles);
  } catch (error) {
    console.error("Get vehicles error:", error);
    return errorResponse(res, "Failed to fetch vehicles", 500);
  }
};

// Get vehicle by ID (Public)
export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return errorResponse(res, "Vehicle not found", 404);
    }
    return successResponse(res, vehicle);
  } catch (error) {
    console.error("Get vehicle error:", error);
    return errorResponse(res, "Failed to fetch vehicle", 500);
  }
};

// Update vehicle (Admin only)
export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!vehicle) {
      return errorResponse(res, "Vehicle not found", 404);
    }

    return successResponse(res, vehicle, "Vehicle updated successfully");
  } catch (error) {
    console.error("Update vehicle error:", error);
    return errorResponse(res, "Failed to update vehicle", 500);
  }
};

// Delete vehicle (Admin only)
export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

    if (!vehicle) {
      return errorResponse(res, "Vehicle not found", 404);
    }

    return successResponse(res, null, "Vehicle deleted successfully");
  } catch (error) {
    console.error("Delete vehicle error:", error);
    return errorResponse(res, "Failed to delete vehicle", 500);
  }
};
