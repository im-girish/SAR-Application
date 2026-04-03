// src/controllers/detect.controller.js
import { detectFromBuffer } from "../services/ml.service.js";
import {
  generateDetectionPdf,
  sendDetectionReportEmail,
} from "../services/report.service.js";
import Admin from "../models/Admin.js";
import { successResponse, errorResponse } from "../utils/response.util.js";

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
      req.file.originalname,
    );

    // Optionally: store result in DB (detection logs). Add your DB logic here.

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error(
      "detectHandler error:",
      err?.response?.data ?? err.message ?? err,
    );
    return res.status(500).json({
      success: false,
      message: "ML inference failed",
      detail: err?.response?.data ?? err.message,
    });
  }
}

/**
 * POST /api/ml/generate-pdf
 * Generate PDF report for detection results
 * Body: { predictions: [...], fileName: "image.jpg" }
 */
export async function generatePdfReport(req, res) {
  try {
    const { predictions = [], fileName = "unknown.jpg" } = req.body;

    if (!predictions || predictions.length === 0) {
      return errorResponse(res, "No detection data provided", 400);
    }

    const detectionData = {
      predictions,
      fileName,
      uploadTime: new Date().toLocaleString(),
      id: `RPT_${Date.now()}`,
    };

    const pdfBuffer = await generateDetectionPdf(detectionData);

    // Send PDF as downloadable file
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="detection_report_${Date.now()}.pdf"`,
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF Generation error:", error);
    return errorResponse(res, "Failed to generate PDF", 500);
  }
}

/**
 * POST /api/ml/send-report
 * Send detection report via email
 * Body: { predictions: [...], fileName: "image.jpg", adminEmail: "admin@example.com" }
 */
export async function sendReportEmail(req, res) {
  try {
    const { predictions = [], fileName = "unknown.jpg", adminEmail } = req.body;
    const adminId = req.user?.id; // From auth middleware

    if (!adminEmail && !adminId) {
      return errorResponse(res, "Admin email or ID is required", 400);
    }

    // If adminId provided, fetch admin email from DB
    let recipientEmail = adminEmail;
    if (!recipientEmail && adminId) {
      const admin = await Admin.findById(adminId);
      recipientEmail = admin?.email;
    }

    if (!recipientEmail) {
      return errorResponse(res, "Could not determine recipient email", 400);
    }

    const detectionData = {
      predictions,
      fileName,
      uploadTime: new Date().toLocaleString(),
      id: `RPT_${Date.now()}`,
    };

    // Generate PDF
    const pdfBuffer = await generateDetectionPdf(detectionData);

    // Send email with PDF
    const emailResult = await sendDetectionReportEmail(
      recipientEmail,
      detectionData,
      pdfBuffer,
    );

    if (!emailResult.success) {
      return errorResponse(
        res,
        emailResult.error || "Failed to send email",
        500,
      );
    }

    return successResponse(
      res,
      {
        message: `Report sent to ${recipientEmail}`,
        email: recipientEmail,
      },
      "Detection report sent successfully",
    );
  } catch (error) {
    console.error("Send Report error:", error);
    return errorResponse(res, "Failed to send report", 500);
  }
}
