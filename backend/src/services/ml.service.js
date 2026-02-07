// src/services/ml.service.js
import axios from "axios";
import FormData from "form-data";

/**
 * detectFromBuffer
 * @param {Buffer} buffer - image buffer (req.file.buffer)
 * @param {string} filename - original filename
 * @returns {Promise<Object>} - response JSON from ML service
 */
export async function detectFromBuffer(buffer, filename = "image.jpg") {
  const ML_URL = process.env.ML_URL || "http://localhost:8000/detect";

  const form = new FormData();
  form.append("file", buffer, { filename, contentType: "image/jpeg" });

  // axios needs the form headers
  const headers = {
    ...form.getHeaders(),
    // if you need auth to ML service, include here:
    // Authorization: `Bearer ${process.env.ML_API_KEY}`
  };

  const axiosConfig = {
    headers,
    timeout: 120000, // 2 minutes (adjust if needed)
  };

  const resp = await axios.post(ML_URL, form, axiosConfig);
  return resp.data;
}
