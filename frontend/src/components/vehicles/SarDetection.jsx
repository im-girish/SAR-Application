import React, { useState, useRef } from "react";
import axios from "axios";

const SarDetectionPage = () => {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setImageUrl(URL.createObjectURL(f));
    setResults([]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please choose an image");

    setLoading(true);
    setResults([]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:5000/api/ml", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const preds = res.data?.data?.predictions || [];
      setResults(preds);

      setTimeout(drawBoxes, 200); // wait for image render
    } catch (err) {
      console.error(err);
      alert("Detection failed");
    } finally {
      setLoading(false);
    }
  };

  const drawBoxes = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;
    ctx.font = "14px Arial";

    results.forEach((det) => {
      const [x1, y1, x2, y2] = det.bbox;
      const w = x2 - x1;
      const h = y2 - y1;

      ctx.strokeStyle = "#00ff99";
      ctx.strokeRect(x1, y1, w, h);

      ctx.fillStyle = "#00ff99";
      ctx.fillText(
        `${det.class} (${(det.confidence * 100).toFixed(1)}%)`,
        x1,
        y1 > 15 ? y1 - 5 : y1 + 15
      );
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-extrabold text-lime-200">
        SAR Image Target Detection
      </h1>

      {/* Upload */}
      <div className="flex gap-4 items-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="text-emerald-100"
        />
        <button
          onClick={handleUpload}
          disabled={loading}
          className="px-6 py-2 rounded-full bg-lime-600 text-black font-semibold hover:bg-lime-500"
        >
          {loading ? "Detecting..." : "Upload & Detect"}
        </button>
      </div>

      {/* Image + Canvas */}
      {imageUrl && (
        <div className="relative inline-block border border-emerald-500/40">
          <img
            ref={imgRef}
            src={imageUrl}
            alt="SAR"
            onLoad={drawBoxes}
            className="max-w-full"
          />
          <canvas ref={canvasRef} className="absolute top-0 left-0" />
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((r, i) => (
            <div
              key={i}
              className="border border-lime-400/50 p-4 rounded-md bg-black/40"
            >
              <p>
                <b>Target:</b> {r.class}
              </p>
              <p>
                <b>Confidence:</b> {r.confidence}
              </p>
              <p>
                <b>Threat:</b> {r.threat}
              </p>
              <p>
                <b>Impact:</b> {r.harm}
              </p>
              <p className="text-xs text-gray-400">BBox: {r.bbox.join(", ")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SarDetectionPage;
