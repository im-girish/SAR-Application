// D:\SAR-APP\frontend\src\pages\AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import VehicleList from "../components/vehicles/VehicleList";
import VehicleForm from "../components/vehicles/VehicleForm";
import { vehicleApi } from "../api/vehicleApi";

const AdminDashboard = () => {
  const { admin } = useAuth();
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const handleBack = () => navigate(-1);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await vehicleApi.getAll();
      const list = Array.isArray(response.data?.data) ? response.data.data : [];
      setVehicles(list);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVehicle = () => {
    setEditingVehicle(null);
    setShowForm(true);
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingVehicle(null);
  };

  const handleVehicleSaved = () => {
    fetchVehicles();
    handleFormClose();
  };

  const handleDeleteVehicle = async (id) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await vehicleApi.delete(id);
        fetchVehicles();
      } catch (error) {
        console.error("Error deleting vehicle:", error);
        alert("Failed to delete vehicle");
      }
    }
  };

  const goToVehiclesPage = () => {
    navigate("/vehicles");
  };

  const goToSarDetection = () => {
    navigate("/sar-detection");
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex items-center gap-1 rounded-full border border-purple-400/80 bg-purple-700/70 px-4 py-1.5 text-xs font-semibold text-purple-50 shadow-[0_0_20px_rgba(147,51,234,0.9)] hover:bg-purple-500 transition"
      >
        ← Back
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="section-label">Command Center</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-lime-200">
            Admin Operational Console
          </h1>
          <p className="mt-2 text-sm text-emerald-200/80">
            Manage military vehicle registry and readiness status.
          </p>
        </div>

        {/* Right action buttons */}
        <div className="flex flex-col items-end gap-3">
          <button
            onClick={goToVehiclesPage}
            className="px-5 py-2 rounded-full bg-emerald-500/20 text-emerald-100 border border-emerald-400/70 shadow-[0_0_18px_rgba(16,185,129,0.9)] hover:bg-emerald-500/35 transition text-sm font-semibold"
          >
            Show Vehicle Details →
          </button>

          <button
            onClick={handleCreateVehicle}
            className="px-5 py-2 rounded-full bg-sky-600 text-white border border-sky-300 shadow-[0_0_18px_rgba(59,130,246,0.9)] hover:bg-sky-500 transition text-sm font-semibold"
          >
            + Register Vehicle
          </button>

          {/* 🔥 SAR BUTTON (ONLY NAVIGATION) */}
          <button
            onClick={goToSarDetection}
            className="px-5 py-2 rounded-full bg-lime-600 text-black border border-lime-400 shadow-[0_0_18px_rgba(163,230,53,0.9)] hover:bg-lime-500 transition text-sm font-semibold"
          >
            SAR Image Detection →
          </button>
        </div>
      </div>

      {/* Operator card */}
      <div className="glass-card p-6">
        <p className="section-label">Operator</p>
        <h2 className="text-xl font-semibold text-emerald-100">
          Welcome, {admin?.username || admin?.name}
        </h2>
        <p className="text-sm text-emerald-100/80 mt-1">
          Authorized to add, update, and retire military vehicle records.
        </p>
      </div>

      {/* Vehicle form */}
      {showForm && (
        <div className="glass-card p-6">
          <VehicleForm
            vehicle={editingVehicle}
            onSave={handleVehicleSaved}
            onCancel={handleFormClose}
          />
        </div>
      )}

      {/* Vehicle list */}
      <VehicleList
        vehicles={vehicles}
        loading={loading}
        onEdit={handleEditVehicle}
        onDelete={handleDeleteVehicle}
      />
    </div>
  );
};

export default AdminDashboard;
