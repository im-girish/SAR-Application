// backend/src/routes/detect.routes.js
import express from "express";
import multer from "multer";
import { detectHandler } from "../controllers/detect.controller.js";
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
  detectHandler
);

export default router;
