import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

const SarDetectionPage = () => {
  const navigate = useNavigate();
  const { admin } = useAuth();

  const fileInputRef = useRef(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [detectionAttempted, setDetectionAttempted] = useState(false);

  /* ================= DRAW GRID BBOX ================= */
  useEffect(() => {
    if (!imgRef.current || !canvasRef.current || results.length === 0) return;

    const img = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const displayWidth = img.clientWidth;
    const displayHeight = img.clientHeight;

    canvas.width = displayWidth;
    canvas.height = displayHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaleX = displayWidth / img.naturalWidth;
    const scaleY = displayHeight / img.naturalHeight;

    results.forEach((det) => {
      let [x1, y1, x2, y2] = det.bbox;

      // Scale bbox to displayed image
      x1 *= scaleX;
      x2 *= scaleX;
      y1 *= scaleY;
      y2 *= scaleY;

      const w = x2 - x1;
      const h = y2 - y1;

      // Outer bbox
      ctx.strokeStyle = "#22ff88";
      ctx.lineWidth = 2;
      ctx.strokeRect(x1, y1, w, h);

      // Grid lines
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(x1 + w / 3, y1);
      ctx.lineTo(x1 + w / 3, y2);
      ctx.moveTo(x1 + (2 * w) / 3, y1);
      ctx.lineTo(x1 + (2 * w) / 3, y2);

      ctx.moveTo(x1, y1 + h / 3);
      ctx.lineTo(x2, y1 + h / 3);
      ctx.moveTo(x1, y1 + (2 * h) / 3);
      ctx.lineTo(x2, y1 + (2 * h) / 3);
      ctx.stroke();

      ctx.setLineDash([]);

      // Label (NO confidence on image)
      ctx.fillStyle = "#22ff88";
      ctx.font = "14px monospace";
      ctx.fillText(det.class, x1 + 4, y1 - 6 > 10 ? y1 - 6 : y1 + 14);
    });
  }, [results]);

  /* ================= FILE ================= */
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    setImageUrl(URL.createObjectURL(selected));
    setResults([]);
    toast.success(`📸 Image uploaded: ${selected.name}`);
  };

  /* ================= API ================= */
  const handleDetect = async () => {
    if (!file) {
      toast.error("❌ Please select a SAR image first");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axiosClient.post("/ml", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResults(res.data?.data?.predictions || []);
      setDetectionAttempted(true);
      toast.success("✅ Detection completed successfully!");
    } catch (error) {
      toast.error("❌ Detection failed. Please try again.");
      console.error("Detection error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= DOWNLOAD PDF ================= */
  const handleDownloadPdf = async () => {
    if (!results || results.length === 0) {
      toast.error("❌ No detection results to download");
      return;
    }

    setPdfLoading(true);
    try {
      const response = await axiosClient.post(
        "/ml/generate-pdf",
        {
          predictions: results,
          fileName: file?.name || "detection.jpg",
        },
        {
          responseType: "blob",
        },
      );

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `detection_report_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("✅ PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF download error:", error);
      toast.error("❌ Failed to download PDF. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  /* ================= SEND REPORT EMAIL ================= */
  const handleSendReport = async () => {
    if (!results || results.length === 0) {
      toast.error("❌ No detection results to send");
      return;
    }

    if (!admin?.email) {
      toast.error("❌ Admin email not found");
      return;
    }

    setEmailLoading(true);
    try {
      const response = await axiosClient.post("/ml/send-report", {
        predictions: results,
        fileName: file?.name || "detection.jpg",
        adminEmail: admin.email,
      });

      toast.success("✅ Report sent successfully to your email!");
    } catch (error) {
      console.error("Email send error:", error);
      const errorMsg = error.response?.data?.message || "Failed to send report";
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 md:space-y-10 px-2 sm:px-4">
      {/* BACK */}
      <button
        onClick={() => navigate("/")}
        className="px-4 sm:px-6 py-2 rounded-full bg-purple-700/80 text-purple-100 text-xs sm:text-sm
                   border border-purple-400 shadow-[0_0_22px_rgba(168,85,247,0.9)]"
      >
        ← Back to Command Center
      </button>

      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-lime-300">
        SAR Image Target Detection
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10">
        {/* LEFT */}
        <div className="glass-card p-4 sm:p-6 space-y-4 sm:space-y-6 border border-lime-500/40">
          <button
            onClick={() => fileInputRef.current.click()}
            className="w-full px-4 sm:px-6 py-2 rounded-full bg-lime-600 font-semibold text-sm sm:text-base"
          >
            Choose SAR Image
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileChange}
          />

          {file && (
            <p className="text-emerald-200 text-xs sm:text-sm truncate">
              {file.name}
            </p>
          )}

          <button
            onClick={handleDetect}
            disabled={loading}
            className="w-full px-8 py-2 rounded-full bg-emerald-500 font-semibold text-sm sm:text-base"
          >
            {loading ? "Detecting..." : "Upload & Detect"}
          </button>
        </div>

        {/* RIGHT */}
        <div className="glass-card p-4 sm:p-6 border border-emerald-500/40">
          <h2 className="text-lg sm:text-xl text-emerald-200 mb-4">
            Uploaded SAR Image
          </h2>

          {imageUrl ? (
            <div className="relative border border-emerald-400 rounded-lg flex justify-center bg-black/50 p-2 sm:p-3">
              <div className="relative max-w-full max-h-[300px] sm:max-h-[400px] md:max-h-[500px]">
                <img
                  ref={imgRef}
                  src={imageUrl}
                  alt="SAR"
                  className="w-auto h-auto max-h-[300px] sm:max-h-[400px] md:max-h-[500px] object-contain bg-black rounded-lg"
                />
                <canvas ref={canvasRef} className="absolute top-0 left-0" />
              </div>
            </div>
          ) : (
            <p className="text-emerald-300 text-sm">No image uploaded</p>
          )}
        </div>
      </div>

      {/* RESULTS */}
      <h2 className="text-2xl sm:text-3xl font-bold text-lime-300">
        Detection Results
      </h2>

      {/* UNKNOWN */}
      {results.length === 0 && imageUrl && !loading && detectionAttempted && (
        <div className="glass-card p-4 sm:p-6 border border-red-500/60">
          <h3 className="text-red-400 font-bold text-sm sm:text-base">
            UNKNOWN TARGET
          </h3>
          <p className="text-emerald-200 text-xs sm:text-sm">
            Unable to detect known SAR military objects.
          </p>
        </div>
      )}

      {/* ACTION BUTTONS (Show when results exist) */}
      {results.length > 0 && (
        <div className="glass-card p-4 sm:p-6 border border-yellow-500/50 bg-yellow-950/20">
          <h3 className="text-yellow-300 font-bold mb-3 sm:mb-4 text-sm sm:text-base">
            📋 Report Actions
          </h3>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={pdfLoading}
              className="flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold text-white text-xs sm:text-sm
                         shadow-[0_0_15px_rgba(37,99,235,0.6)] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {pdfLoading ? "🔄 Generating..." : "⬇️ Download PDF"}
            </button>

            {/* Send Report Button */}
            <button
              onClick={handleSendReport}
              disabled={emailLoading}
              className="flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-green-600 hover:bg-green-500 font-semibold text-white text-xs sm:text-sm
                         shadow-[0_0_15px_rgba(34,197,94,0.6)] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {emailLoading ? "🔄 Sending..." : "✉️ Send Report"}
            </button>
          </div>
          <p className="text-xs sm:text-sm text-emerald-200 mt-3">
            💡 Download your detection report as PDF or send it directly to
            admin email
          </p>
        </div>
      )}

      {/* DETECTED */}
      {results.map((r, i) => (
        <div
          key={i}
          className="glass-card p-4 sm:p-6 border border-lime-500/50
                     shadow-[0_0_25px_rgba(132,204,22,0.25)]"
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
            <h3 className="text-lg sm:text-xl text-lime-300">
              Target: {r.class}
            </h3>
            <span className="px-4 py-1 rounded-full bg-lime-500/20 text-lime-300 text-xs sm:text-sm whitespace-nowrap">
              Confidence: {r.confidence.toFixed(3)}
            </span>
          </div>
          {/* TYPE */}
          <p className="text-emerald-300 mb-1 text-xs sm:text-sm mt-3">
            <strong>Type:</strong> {r.type}
          </p>
          <p className="text-emerald-200 text-xs sm:text-sm">
            <b>Threat:</b> {r.threat}
          </p>
          <p className="text-emerald-200 text-xs sm:text-sm">
            <b>Impact:</b> {r.harm}
          </p>
        </div>
      ))}
    </div>
  );
};

export default SarDetectionPage;
