// backend/src/routes/detect.routes.js
import express from "express";
import multer from "multer";
import {
  detectHandler,
  generatePdfReport,
  sendReportEmail,
} from "../controllers/detect.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Multer in-memory storage (no disk save)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

/**
 * POST /api/ml
 * Admin-only SAR image detection
 * field name: file
 */
router.post(
  "/",
  authMiddleware, // 🔐 Admin verification
  upload.single("file"),
  detectHandler,
);

/**
 * POST /api/ml/generate-pdf
 * Generate PDF report for detection results
 */
router.post("/generate-pdf", authMiddleware, generatePdfReport);

/**
 * POST /api/ml/send-report
 * Send detection report via email to admin
 */
router.post("/send-report", authMiddleware, sendReportEmail);

export default router;
