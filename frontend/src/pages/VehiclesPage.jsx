// D:\SAR-APP\frontend\src\pages\VehiclesPage.jsx
import React, { useState, useEffect } from "react";
import { vehicleApi } from "../api/vehicleApi";
import VehicleList from "../components/vehicles/VehicleList";

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await vehicleApi.getAll();
        setVehicles(res.data);
      } catch (err) {
        console.error("Error loading vehicles:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  return (
    <div className="space-y-6">
      <VehicleList vehicles={vehicles} loading={loading} readOnly={true} />
    </div>
  );
};

export default VehiclesPage;
