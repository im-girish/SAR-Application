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
      setVehicles(response.data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
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

  return (
    <div className="space-y-6">
      {/* Purple back button */}
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex items-center gap-1 rounded-full border border-purple-400/80 bg-purple-700/70 px-4 py-1.5 text-xs font-semibold text-purple-50 shadow-[0_0_20px_rgba(147,51,234,0.9)] hover:bg-purple-500 hover:border-purple-300 hover:shadow-[0_0_26px_rgba(167,139,250,1)] transition"
      >
        ← Back
      </button>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="section-label">Command Center</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-lime-200 drop-shadow-[0_0_25px_rgba(190,242,100,0.8)]">
            Admin Ops Console
          </h1>
          <p className="mt-2 text-sm text-emerald-200/80">
            Manage military vehicle registry and readiness status.
          </p>
        </div>

        <button
          onClick={handleCreateVehicle}
          className="px-5 py-2 rounded-full bg-emerald-500/25 text-emerald-100 border border-emerald-400/70 shadow-[0_0_20px_rgba(16,185,129,0.9)] hover:bg-emerald-500/40 transition"
        >
          + Register Vehicle
        </button>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="section-label">Operator</p>
            <h2 className="text-xl font-semibold text-emerald-100">
              Welcome, {admin?.name}
            </h2>
          </div>
          <span className="pill">
            <span className="status-dot" />
            Admin Channel
          </span>
        </div>
        <p className="text-sm text-emerald-100/80">
          Authorized to add, update, and retire military vehicle records.
        </p>
      </div>

      {showForm && (
        <div className="glass-card p-6">
          <VehicleForm
            vehicle={editingVehicle}
            onSave={handleVehicleSaved}
            onCancel={handleFormClose}
          />
        </div>
      )}

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
