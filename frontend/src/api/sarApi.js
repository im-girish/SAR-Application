import axiosClient from "./axiosClient";

/**
 * Upload SAR image (Admin only)
 */
export const uploadSarImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axiosClient.post("/ml", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};
