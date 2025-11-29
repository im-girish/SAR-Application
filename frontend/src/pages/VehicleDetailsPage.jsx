// D:\SAR-APP\frontend\src\pages\VehicleDetailsPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { vehicleApi } from "../api/vehicleApi";

const VehicleDetailsPage = () => {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchVehicle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchVehicle = async () => {
    try {
      const response = await vehicleApi.getById(id);
      setVehicle(response.data);
    } catch (error) {
      console.error("Error fetching vehicle:", error);
      setError("Vehicle not found");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="space-y-4">
        <div className="glass-card border border-red-500/60 text-red-200 px-4 py-3">
          {error || "Vehicle not found"}
        </div>
        <Link
          to="/news"
          className="text-emerald-300 hover:text-emerald-100 text-sm"
        >
          ← Back to News
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        to="/news"
        className="text-emerald-300 hover:text-emerald-100 text-sm"
      >
        ← Back to News
      </Link>

      <div className="glass-card p-6">
        <h1 className="text-3xl font-bold text-lime-200 mb-3">
          {vehicle.name}
        </h1>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-100 text-sm font-medium rounded-full capitalize border border-emerald-400/70">
            {vehicle.type}
          </span>
          <span className="px-3 py-1 bg-sky-500/20 text-sky-100 text-sm font-medium rounded-full capitalize border border-sky-400/60">
            {vehicle.category}
          </span>
          <span className="px-3 py-1 bg-purple-500/20 text-purple-100 text-sm font-medium rounded-full border border-purple-400/60">
            {vehicle.country}
          </span>
          <span
            className={`px-3 py-1 text-sm font-medium rounded-full border ${
              vehicle.inService
                ? "bg-emerald-500/20 text-emerald-100 border-emerald-400/70"
                : "bg-red-500/20 text-red-100 border-red-400/70"
            }`}
          >
            {vehicle.inService ? "In Service" : "Retired"}
          </span>
        </div>

        <p className="text-sm text-emerald-100/80 mb-6">
          {vehicle.description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-emerald-50 mb-4">
              Specifications
            </h2>
            <div className="space-y-3 text-sm text-emerald-100/80">
              {vehicle.specifications.weight && (
                <div className="flex justify-between border-b border-emerald-500/20 pb-2">
                  <span className="font-medium">Weight:</span>
                  <span>{vehicle.specifications.weight}</span>
                </div>
              )}
              {vehicle.specifications.crew && (
                <div className="flex justify-between border-b border-emerald-500/20 pb-2">
                  <span className="font-medium">Crew:</span>
                  <span>{vehicle.specifications.crew} personnel</span>
                </div>
              )}
              {vehicle.specifications.speed && (
                <div className="flex justify-between border-b border-emerald-500/20 pb-2">
                  <span className="font-medium">Speed:</span>
                  <span>{vehicle.specifications.speed}</span>
                </div>
              )}
              {vehicle.specifications.range && (
                <div className="flex justify-between border-b border-emerald-500/20 pb-2">
                  <span className="font-medium">Range:</span>
                  <span>{vehicle.specifications.range}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-emerald-50 mb-4">
              Additional Info
            </h2>
            <div className="space-y-3 text-sm text-emerald-100/80">
              {vehicle.yearIntroduced && (
                <div className="flex justify-between border-b border-emerald-500/20 pb-2">
                  <span className="font-medium">Year Introduced:</span>
                  <span>{vehicle.yearIntroduced}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-emerald-500/20 pb-2">
                <span className="font-medium">Status:</span>
                <span
                  className={
                    vehicle.inService ? "text-emerald-300" : "text-red-300"
                  }
                >
                  {vehicle.inService ? "Active Service" : "Retired"}
                </span>
              </div>
            </div>

            {vehicle.specifications.armament &&
              vehicle.specifications.armament.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-emerald-50 mb-2">
                    Armament
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {vehicle.specifications.armament.map((weapon, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-slate-900/70 text-emerald-100 text-xs rounded border border-emerald-500/30"
                      >
                        {weapon}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsPage;
