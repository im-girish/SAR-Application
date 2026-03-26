import axiosClient from "./axiosClient";

/**
 * Upload SAR image (Admin only)
 * Sends to Node.js backend which forwards to Python ML Service
 */
export const uploadSarImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    console.log("📤 Sending image to Node.js backend → Python ML Service...");

    const res = await axiosClient.post("/ml/detect", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("✅ Python ML Service Response:", res.data);
    console.log("🎯 Detections from Python:", res.data?.data?.predictions);

    return res.data;
  } catch (error) {
    console.error(
      "❌ ML Service Error:",
      error.response?.data || error.message,
    );

    // ✅ Prevent crash
    return {
      success: false,
      message: "Detection failed",
      error: error.response?.data || error.message,
    };
  }
};
