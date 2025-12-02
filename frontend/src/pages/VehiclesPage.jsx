// D:\SAR-APP\frontend\src\pages\VehiclesPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { vehicleApi } from "../api/vehicleApi";
import VehicleList from "../components/vehicles/VehicleList";

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await vehicleApi.getAll();
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setVehicles(list);
      } catch (err) {
        console.error("Error loading vehicles:", err);
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const goBackToCommandCenter = () => {
    navigate("/"); // Command Center route
  };

  return (
    <div className="space-y-6">
      {/* Back button at top */}
      <button
        type="button"
        onClick={goBackToCommandCenter}
        className="inline-flex items-center gap-1 rounded-full border border-purple-400/80 bg-purple-700/70 px-4 py-1.5 text-xs font-semibold text-purple-50 shadow-[0_0_20px_rgba(147,51,234,0.9)] hover:bg-purple-500 hover:border-purple-300 hover:shadow-[0_0_26px_rgba(167,139,250,1)] transition"
      >
        ← Back to Command Center
      </button>

      {/* Read-only vehicles table */}
      <VehicleList vehicles={vehicles} loading={loading} readOnly={true} />
    </div>
  );
};

export default VehiclesPage;
