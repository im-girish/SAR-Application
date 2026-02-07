// src/controllers/detect.controller.js
import { detectFromBuffer } from "../services/ml.service.js";

/**
 * POST /api/ml
 * Expects multipart/form-data with field 'file'
 */
export async function detectHandler(req, res) {
  try {
    if (!req.file || !req.file.buffer) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    // Optionally, you can validate MIME type:
    // if (!req.file.mimetype.startsWith("image/")) { ... }

    // Send file buffer to ML service
    const result = await detectFromBuffer(
      req.file.buffer,
      req.file.originalname
    );

    // Optionally: store result in DB (detection logs). Add your DB logic here.

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error(
      "detectHandler error:",
      err?.response?.data ?? err.message ?? err
    );
    return res.status(500).json({
      success: false,
      message: "ML inference failed",
      detail: err?.response?.data ?? err.message,
    });
  }
}
