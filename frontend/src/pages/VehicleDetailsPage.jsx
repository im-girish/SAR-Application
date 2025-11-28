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
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || "Vehicle not found"}
        </div>
        <Link
          to="/news"
          className="text-indigo-600 hover:text-indigo-800 mt-4 inline-block"
        >
          ← Back to News
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/news"
        className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block"
      >
        ← Back to News
      </Link>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {vehicle.name}
          </h1>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full capitalize">
              {vehicle.type}
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full capitalize">
              {vehicle.category}
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
              {vehicle.country}
            </span>
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${
                vehicle.inService
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {vehicle.inService ? "In Service" : "Retired"}
            </span>
          </div>

          <p className="text-gray-600 mb-6">{vehicle.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Specifications</h2>
              <div className="space-y-3">
                {vehicle.specifications.weight && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Weight:</span>
                    <span>{vehicle.specifications.weight}</span>
                  </div>
                )}
                {vehicle.specifications.crew && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Crew:</span>
                    <span>{vehicle.specifications.crew} personnel</span>
                  </div>
                )}
                {vehicle.specifications.speed && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Speed:</span>
                    <span>{vehicle.specifications.speed}</span>
                  </div>
                )}
                {vehicle.specifications.range && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Range:</span>
                    <span>{vehicle.specifications.range}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Additional Info</h2>
              <div className="space-y-3">
                {vehicle.yearIntroduced && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Year Introduced:</span>
                    <span>{vehicle.yearIntroduced}</span>
                  </div>
                )}
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Status:</span>
                  <span
                    className={
                      vehicle.inService ? "text-green-600" : "text-red-600"
                    }
                  >
                    {vehicle.inService ? "Active Service" : "Retired"}
                  </span>
                </div>
              </div>

              {vehicle.specifications.armament &&
                vehicle.specifications.armament.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">Armament</h3>
                    <div className="flex flex-wrap gap-2">
                      {vehicle.specifications.armament.map((weapon, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
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
    </div>
  );
};

export default VehicleDetailsPage;
