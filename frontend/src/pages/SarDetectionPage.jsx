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

  const [files, setFiles] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [allResults, setAllResults] = useState({});
  const [detectedImages, setDetectedImages] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [detectionAttempted, setDetectionAttempted] = useState(false);

  /* ================= DRAW GRID BBOX ================= */
  useEffect(() => {
    if (!imgRef.current || !canvasRef.current || imageUrls.length === 0) return;

    const currentImageKey = imageUrls[currentImageIndex];
    const results = allResults[currentImageKey] || [];
    if (results.length === 0) return;

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
  }, [allResults, currentImageIndex, imageUrls]);

  /* ================= FILE ================= */
  const handleFileChange = (e) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newFiles = Array.from(selectedFiles);
    const newUrls = newFiles.map((f) => URL.createObjectURL(f));

    setFiles((prev) => [...prev, ...newFiles]);
    setImageUrls((prev) => [...prev, ...newUrls]);
    setCurrentImageIndex(0);
    setAllResults({});
    setDetectedImages(new Set());
    setDetectionAttempted(false);
    toast.success(`📸 ${newFiles.length} image(s) uploaded`);
  };

  /* ================= API ================= */
  const handleDetect = async () => {
    if (files.length === 0) {
      toast.error("❌ Please select SAR image(s) first");
      return;
    }

    setLoading(true);
    const newResults = {};
    const detected = new Set();

    try {
      // Process each image
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);

        const res = await axiosClient.post("/ml", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        newResults[imageUrls[i]] = res.data?.data?.predictions || [];
        detected.add(imageUrls[i]);
      }

      setAllResults(newResults);
      setDetectedImages(detected);
      setDetectionAttempted(true);
      toast.success(`✅ Detection completed for ${files.length} image(s)!`);
    } catch (error) {
      toast.error("❌ Detection failed. Please try again.");
      console.error("Detection error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= DOWNLOAD PDF ================= */
  const handleDownloadPdf = async () => {
    const currentImageKey = imageUrls[currentImageIndex];
    const results = allResults[currentImageKey] || [];

    if (!results || results.length === 0) {
      toast.error("❌ No detection results to download for this image");
      return;
    }

    setPdfLoading(true);
    try {
      const response = await axiosClient.post(
        "/ml/generate-pdf",
        {
          predictions: results,
          fileName: files[currentImageIndex]?.name || "detection.jpg",
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
    const currentImageKey = imageUrls[currentImageIndex];
    const results = allResults[currentImageKey] || [];

    if (!results || results.length === 0) {
      toast.error("❌ No detection results to send for this image");
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
        fileName: files[currentImageIndex]?.name || "detection.jpg",
        adminEmail: admin.email,
      });

      toast.success(
        `✅ Report sent successfully! (Image ${currentImageIndex + 1}/${imageUrls.length})`,
      );
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
            Choose SAR Images
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleFileChange}
          />

          {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-emerald-200 text-xs sm:text-sm font-semibold">
                  📁 {files.length} image(s) selected
                </p>
                <button
                  onClick={() => {
                    setFiles([]);
                    setImageUrls([]);
                    setAllResults({});
                    setCurrentImageIndex(0);
                  }}
                  className="text-red-400 hover:text-red-300 text-xs font-semibold"
                >
                  Clear
                </button>
              </div>
              <div className="max-h-[150px] overflow-y-auto space-y-1 bg-slate-900/50 p-2 rounded">
                {files.map((f, idx) => {
                  const isDetected = detectedImages.has(imageUrls[idx]);
                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-full text-left px-2 py-1 rounded text-xs truncate transition flex items-center gap-2 ${
                        currentImageIndex === idx
                          ? "bg-lime-500/40 text-lime-200 font-semibold"
                          : "bg-slate-800 text-emerald-200 hover:bg-slate-700"
                      }`}
                    >
                      <span className="flex-shrink-0 w-4">
                        {isDetected ? "✅" : "⏳"}
                      </span>
                      <span>
                        {idx + 1}. {f.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl text-emerald-200">
              Uploaded SAR Image ({currentImageIndex + 1}/{imageUrls.length})
            </h2>
            {imageUrls.length > 1 && (
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCurrentImageIndex(Math.max(0, currentImageIndex - 1))
                  }
                  disabled={currentImageIndex === 0}
                  className="px-2 py-1 bg-emerald-600/50 text-white text-xs rounded disabled:opacity-50"
                >
                  ← Prev
                </button>
                <button
                  onClick={() =>
                    setCurrentImageIndex(
                      Math.min(imageUrls.length - 1, currentImageIndex + 1),
                    )
                  }
                  disabled={currentImageIndex === imageUrls.length - 1}
                  className="px-2 py-1 bg-emerald-600/50 text-white text-xs rounded disabled:opacity-50"
                >
                  Next →
                </button>
              </div>
            )}
          </div>

          {imageUrls.length > 0 ? (
            <div className="relative border border-emerald-400 rounded-lg flex justify-center bg-black/50 p-2 sm:p-3">
              <div className="relative max-w-full max-h-[300px] sm:max-h-[400px] md:max-h-[500px]">
                <img
                  ref={imgRef}
                  src={imageUrls[currentImageIndex]}
                  alt={`SAR ${currentImageIndex + 1}`}
                  className="w-auto h-auto max-h-[300px] sm:max-h-[400px] md:max-h-[500px] object-contain bg-black rounded-lg"
                />
                <canvas ref={canvasRef} className="absolute top-0 left-0" />
              </div>
            </div>
          ) : (
            <p className="text-emerald-300 text-sm">No images uploaded</p>
          )}
        </div>
      </div>

      {/* RESULTS */}
      <h2 className="text-2xl sm:text-3xl font-bold text-lime-300">
        Detection Results
      </h2>

      {/* DETECTION STATUS */}
      {imageUrls.length > 0 && (
        <div className="glass-card p-4 sm:p-6 border border-blue-500/40">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-blue-300 font-semibold text-sm sm:text-base">
                Detection Progress: {detectedImages.size}/{imageUrls.length}{" "}
                image(s)
              </p>
              <p className="text-blue-200 text-xs sm:text-sm mt-1">
                {detectedImages.size === imageUrls.length
                  ? "✅ All images detected! Ready to send report."
                  : `⏳ ${imageUrls.length - detectedImages.size} image(s) remaining to detect...`}
              </p>
            </div>
            {detectedImages.size === imageUrls.length && (
              <div className="text-lime-400 font-bold text-lg animate-pulse">
                ✨ Ready to Send
              </div>
            )}
          </div>
        </div>
      )}

      {/* UNKNOWN */}
      {(() => {
        const currentImageKey = imageUrls[currentImageIndex];
        const results = allResults[currentImageKey] || [];
        return (
          <>
            {results.length === 0 &&
              imageUrls.length > 0 &&
              detectionAttempted && (
                <div className="glass-card p-4 sm:p-6 border border-red-500/60">
                  <h3 className="text-red-400 font-bold text-sm sm:text-base">
                    UNKNOWN TARGET
                  </h3>
                  <p className="text-emerald-200 text-xs sm:text-sm">
                    Unable to detect known SAR military objects in this image.
                  </p>
                </div>
              )}

            {/* ACTION BUTTONS (Show when results exist) */}
            {results.length > 0 && (
              <div className="glass-card p-4 sm:p-6 border border-yellow-500/50 bg-yellow-950/20">
                <h3 className="text-yellow-300 font-bold mb-3 sm:mb-4 text-sm sm:text-base">
                  📋 Report Actions (Image {currentImageIndex + 1}/{imageUrls.length})
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
                  💡 Download or send this image's detection report to admin email
                </p>
              </div>
            )}

            {/* DETECTED TARGETS */}
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
          </>
        );
      })()}
    </div>
  );
};

export default SarDetectionPage;
