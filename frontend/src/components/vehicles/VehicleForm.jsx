// D:\SAR-APP\frontend\src\components\vehicles\VehicleForm.jsx
import React, { useState, useEffect } from "react";
import { vehicleApi } from "../../api/vehicleApi";

const COUNTRY_OPTIONS = [
  "India",
  "United States",
  "Russia",
  "China",
  "France",
  "United Kingdom",
  "Germany",
  "Israel",
  "Japan",
  "Other",
];

const VehicleForm = ({ vehicle, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "tank",
    category: "ground",
    description: "",
    specifications: {
      weight: "",
      length: "",
      width: "",
      height: "",
      crew: "",
      speed: "",
      range: "",
      armament: [],
    },
    country: "",
    inService: true,
    yearIntroduced: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (vehicle) {
      // ensure specs object exists when editing
      setFormData({
        ...vehicle,
        specifications: {
          weight: vehicle.specifications?.weight || "",
          length: vehicle.specifications?.length || "",
          width: vehicle.specifications?.width || "",
          height: vehicle.specifications?.height || "",
          crew:
            vehicle.specifications?.crew !== undefined &&
            vehicle.specifications?.crew !== null
              ? String(vehicle.specifications.crew)
              : "",
          speed: vehicle.specifications?.speed || "",
          range: vehicle.specifications?.range || "",
          armament: vehicle.specifications?.armament || [],
        },
        yearIntroduced: vehicle.yearIntroduced
          ? String(vehicle.yearIntroduced)
          : "",
      });
    }
  }, [vehicle]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("specs.")) {
      const specField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Build specifications without empty values
      const specs = {};
      const s = formData.specifications;

      if (s.weight) specs.weight = s.weight;
      if (s.length) specs.length = s.length;
      if (s.width) specs.width = s.width;
      if (s.height) specs.height = s.height;
      if (s.crew !== "" && s.crew != null) specs.crew = parseInt(s.crew, 10);
      if (s.speed) specs.speed = s.speed;
      if (s.range) specs.range = s.range;
      if (Array.isArray(s.armament) && s.armament.length > 0) {
        specs.armament = s.armament;
      }

      const submitData = {
        name: formData.name.trim(),
        type: formData.type, // from select: tank/truck/ship/aircraft/other
        category: formData.category, // ground/naval/air
        country: formData.country.trim(),
        description: formData.description.trim(),
        specifications: specs,
        inService: formData.inService,
        yearIntroduced: formData.yearIntroduced
          ? parseInt(formData.yearIntroduced, 10)
          : undefined,
      };

      if (vehicle) {
        await vehicleApi.update(vehicle._id, submitData);
      } else {
        await vehicleApi.create(submitData);
      }

      onSave();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (Array.isArray(err.response?.data?.errors)
            ? err.response.data.errors.join(", ")
            : "Failed to save vehicle")
      );
      console.error("API error:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="glass-card bg-slate-950/95 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-emerald-500/30">
        <div className="px-6 pt-6 pb-4 border-b border-emerald-500/20 flex items-center justify-between">
          <div>
            <p className="section-label text-emerald-300/90">
              {vehicle ? "Edit Asset" : "New Asset"}
            </p>
            <h2 className="text-2xl font-bold text-lime-200">
              {vehicle ? "Update Vehicle Profile" : "Add New Vehicle"}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-emerald-200 hover:text-emerald-100 text-sm"
          >
            ✕ Close
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="border border-red-500/70 bg-red-950/60 text-red-100 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Top grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-emerald-200 uppercase tracking-wide">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-emerald-500/40 bg-slate-950/80 px-3 py-2 text-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-400/80"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-200 uppercase tracking-wide">
                  Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-emerald-500/40 bg-slate-950/80 px-3 py-2 text-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-400/80"
                >
                  <option value="tank">Tank</option>
                  <option value="truck">Truck</option>
                  <option value="ship">Ship</option>
                  <option value="aircraft">Aircraft</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-200 uppercase tracking-wide">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-emerald-500/40 bg-slate-950/80 px-3 py-2 text-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-400/80"
                >
                  <option value="ground">Ground</option>
                  <option value="naval">Naval</option>
                  <option value="air">Air</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-200 uppercase tracking-wide">
                  Country *
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-emerald-500/40 bg-slate-950/80 px-3 py-2 text-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-400/80"
                >
                  <option value="" disabled>
                    Select country
                  </option>
                  {COUNTRY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-emerald-200 uppercase tracking-wide">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                className="mt-1 block w-full rounded-md border border-emerald-500/40 bg-slate-950/80 px-3 py-2 text-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-400/80"
              />
            </div>

            {/* Specifications */}
            <div className="border-t border-emerald-500/20 pt-4">
              <h3 className="text-sm font-semibold text-emerald-200 mb-3">
                Specifications
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-emerald-200 uppercase tracking-wide">
                    Weight
                  </label>
                  <input
                    type="text"
                    name="specs.weight"
                    value={formData.specifications.weight}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-emerald-500/40 bg-slate-950/80 px-3 py-2 text-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-400/80"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-emerald-200 uppercase tracking-wide">
                    Crew
                  </label>
                  <input
                    type="number"
                    name="specs.crew"
                    value={formData.specifications.crew}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-emerald-500/40 bg-slate-950/80 px-3 py-2 text-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-400/80"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-emerald-200 uppercase tracking-wide">
                    Speed
                  </label>
                  <input
                    type="text"
                    name="specs.speed"
                    value={formData.specifications.speed}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-emerald-500/40 bg-slate-950/80 px-3 py-2 text-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-400/80"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-emerald-200 uppercase tracking-wide">
                    Range
                  </label>
                  <input
                    type="text"
                    name="specs.range"
                    value={formData.specifications.range}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-emerald-500/40 bg-slate-950/80 px-3 py-2 text-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-400/80"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="inService"
                checked={formData.inService}
                onChange={handleChange}
                className="h-4 w-4 text-emerald-500 focus:ring-emerald-500 border-emerald-500/60 rounded bg-slate-900"
              />
              <label className="ml-2 block text-sm text-emerald-100">
                Currently in Service
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-md text-sm font-medium text-emerald-100 bg-slate-900/80 border border-emerald-500/30 hover:bg-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.8)] disabled:opacity-60"
              >
                {loading ? "Saving..." : vehicle ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VehicleForm;
