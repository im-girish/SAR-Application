import express from "express";
import { login, verifyOtpAndLogin } from "../controllers/auth.controller.js";
import {
  loginValidator,
  verifyOtpValidator,
} from "../validators/auth.validator.js";
import { validate } from "../middlewares/validation.middleware.js";

const router = express.Router();

router.post("/login", validate(loginValidator), login);
router.post("/verify-otp", validate(verifyOtpValidator), verifyOtpAndLogin);

export default router;
