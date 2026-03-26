import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

const SarDetectionPage = () => {
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

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
  };

  /* ================= API ================= */
  const handleDetect = async () => {
    if (!file) return alert("Please select SAR image");

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axiosClient.post("/ml", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResults(res.data?.data?.predictions || []);
    } catch {
      alert("Detection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* BACK */}
      <button
        onClick={() => navigate("/")}
        className="px-6 py-2 rounded-full bg-purple-700/80 text-purple-100
                   border border-purple-400 shadow-[0_0_22px_rgba(168,85,247,0.9)]"
      >
        ← Back to Command Center
      </button>

      <h1 className="text-4xl font-extrabold text-lime-300">
        SAR Image Target Detection
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* LEFT */}
        <div className="glass-card p-6 space-y-6 border border-lime-500/40">
          <button
            onClick={() => fileInputRef.current.click()}
            className="px-6 py-2 rounded-full bg-lime-600 font-semibold"
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

          {file && <p className="text-emerald-200">{file.name}</p>}

          <button
            onClick={handleDetect}
            disabled={loading}
            className="px-8 py-2 rounded-full bg-emerald-500 font-semibold"
          >
            {loading ? "Detecting..." : "Upload & Detect"}
          </button>
        </div>

        {/* RIGHT */}
        <div className="glass-card p-6 border border-emerald-500/40">
          <h2 className="text-xl text-emerald-200 mb-4">Uploaded SAR Image</h2>

          {imageUrl ? (
            <div className="relative inline-block border border-emerald-400 rounded-lg">
              <img
                ref={imgRef}
                src={imageUrl}
                alt="SAR"
                className="max-w-full bg-black"
              />
              <canvas ref={canvasRef} className="absolute top-0 left-0" />
            </div>
          ) : (
            <p className="text-emerald-300">No image uploaded</p>
          )}
        </div>
      </div>

      {/* RESULTS */}
      <h2 className="text-3xl font-bold text-lime-300">Detection Results</h2>

      {/* UNKNOWN */}
      {results.length === 0 && imageUrl && !loading && (
        <div className="glass-card p-6 border border-red-500/60">
          <h3 className="text-red-400 font-bold">UNKNOWN TARGET</h3>
          <p className="text-emerald-200">
            Unable to detect known SAR military objects.
          </p>
        </div>
      )}

      {/* DETECTED */}
      {results.map((r, i) => (
        <div
          key={i}
          className="glass-card p-6 border border-lime-500/50
                     shadow-[0_0_25px_rgba(132,204,22,0.25)]"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-xl text-lime-300">Target: {r.class}</h3>
            <span className="px-4 py-1 rounded-full bg-lime-500/20 text-lime-300">
              Confidence: {r.confidence.toFixed(3)}
            </span>
          </div>
          {/* TYPE */}
          <p className="text-emerald-300 mb-1">
            <strong>Type:</strong> {r.type}
          </p>
          <p className="text-emerald-200 mt-3">
            <b>Threat:</b> {r.threat}
          </p>
          <p className="text-emerald-200">
            <b>Impact:</b> {r.harm}
          </p>
        </div>
      ))}
    </div>
  );
};

export default SarDetectionPage;
