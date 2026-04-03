import express from "express";
import {
  login,
  verifyOtpAndLogin,
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/auth.controller.js";
import {
  loginValidator,
  verifyOtpValidator,
} from "../validators/auth.validator.js";
import { validate } from "../middlewares/validation.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/login", validate(loginValidator), login);
router.post("/verify-otp", validate(verifyOtpValidator), verifyOtpAndLogin);

// Protected routes
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post("/change-password", authMiddleware, changePassword);

export default router;
