import axiosClient from "./axiosClient";

/**
 * Upload SAR image (Admin only)
 */
export const uploadSarImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await axiosClient.post("/ml/detect", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error) {
    console.error("Upload error:", error);

    // ✅ Prevent crash
    return {
      success: false,
      message: "Detection failed",
    };
  }
};
