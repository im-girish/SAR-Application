import express from "express";
import {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} from "../controllers/vehicle.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  createVehicleValidator,
  updateVehicleValidator,
} from "../validators/vehicle.validator.js";

const router = express.Router();

// Public routes
router.get("/", getAllVehicles);
router.get("/:id", getVehicleById);

// Protected routes (Admin only)
router.post(
  "/",
  authMiddleware,
  validate(createVehicleValidator),
  createVehicle
);
router.put(
  "/:id",
  authMiddleware,
  validate(updateVehicleValidator),
  updateVehicle
);
router.delete("/:id", authMiddleware, deleteVehicle);

export default router;
