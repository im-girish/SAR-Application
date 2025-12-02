import React, { useMemo, useState } from "react";

const LIMIT_OPTIONS = [
  { value: "top5", label: "Top 5" },
  { value: "top10", label: "Top 10" },
  { value: "weak5", label: "Weak 5" },
  { value: "weak10", label: "Weak 10" },
  { value: "all", label: "All" },
];

const VehicleList = ({
  vehicles,
  loading,
  onEdit,
  onDelete,
  readOnly = false,
}) => {
  const [countryQuery, setCountryQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [limitMode, setLimitMode] = useState("top10");

  const grouped = useMemo(() => {
    let data = [...vehicles];

    if (typeFilter !== "all") {
      data = data.filter((v) => v.type === typeFilter);
    }

    if (countryQuery.trim()) {
      const q = countryQuery.toLowerCase();
      data = data.filter((v) => v.country?.toLowerCase().includes(q));
    }

    const applyLimit = (arr) => {
      if (limitMode === "all") return arr;
      if (limitMode === "top5") return arr.slice(0, 5);
      if (limitMode === "top10") return arr.slice(0, 10);
      if (limitMode === "weak5") return arr.slice(-5);
      if (limitMode === "weak10") return arr.slice(-10);
      return arr;
    };

    data = applyLimit(data);

    const groups = data.reduce((acc, v) => {
      const key = v.category || "other";
      if (!acc[key]) acc[key] = [];
      acc[key].push(v);
      return acc;
    }, {});

    return groups;
  }, [vehicles, countryQuery, typeFilter, limitMode]);

  if (loading) {
    return (
      <div className="glass-card bg-slate-950/90 p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400" />
        </div>
      </div>
    );
  }

  const hasVehicles = vehicles && vehicles.length > 0;
  const hasResults = Object.keys(grouped).length > 0;

  return (
    <div className="space-y-5">
      {/* Top row: heading + controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="section-label">Arsenal Overview</p>
          <h3 className="text-2xl font-extrabold text-lime-200">
            Military Vehicles
          </h3>
          <p className="mt-1 text-sm text-emerald-200/80 max-w-md">
            Filter and scan tracked assets by category, country and priority.
          </p>
        </div>

        <div className="glass-card bg-slate-950/95 px-4 py-3 flex flex-col md:flex-row md:items-center gap-3 md:gap-4 border border-emerald-500/40">
          <div className="flex items-center gap-2">
            <span className="text-[0.7rem] text-emerald-200/80 uppercase tracking-[0.18em]">
              Country
            </span>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by country..."
                className="pl-7 pr-3 py-1.5 rounded-full text-xs border border-emerald-500/70 bg-slate-900 text-emerald-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                value={countryQuery}
                onChange={(e) => setCountryQuery(e.target.value)}
              />
              <span className="absolute left-2 top-1.5 text-emerald-300 text-xs">
                🔍
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 text-[0.68rem]">
            {["all", "tank", "truck", "ship", "aircraft", "other"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 rounded-full border transition ${
                  typeFilter === t
                    ? "bg-emerald-500/40 border-emerald-300 text-emerald-50 shadow-[0_0_10px_rgba(16,185,129,0.9)]"
                    : "bg-slate-900 border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/15"
                }`}
              >
                {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[0.7rem] text-emerald-200/80 uppercase tracking-[0.18em]">
              Show
            </span>
            <select
              className="px-3 py-1.5 rounded-full text-xs border border-emerald-500/70 bg-slate-900 text-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={limitMode}
              onChange={(e) => setLimitMode(e.target.value)}
            >
              {LIMIT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {!hasVehicles ? (
        <div className="glass-card bg-slate-950/90 p-6 text-center text-emerald-100/80">
          No vehicles found. Add your first vehicle.
        </div>
      ) : !hasResults ? (
        <div className="glass-card bg-slate-950/90 p-6 text-center text-emerald-100/80">
          No vehicles match the current filters.
        </div>
      ) : (
        <div
          className="space-y-5 translate-y-3 opacity-0"
          style={{ animation: "slideInUp 0.7s ease-out forwards" }}
        >
          {Object.entries(grouped).map(([category, list]) => (
            <div
              key={category}
              className="rounded-3xl border border-emerald-500/40 bg-slate-950/90 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.85)]"
            >
              <div className="flex flex-wrap justify-between items-center mb-3 gap-3">
                <div>
                  <h4 className="text-lg md:text-xl font-extrabold text-lime-200">
                    {category === "ground"
                      ? "Ground Forces"
                      : category === "air"
                      ? "Air Assets"
                      : category === "naval"
                      ? "Artillery & AD"
                      : "Logistics & Support"}
                  </h4>
                  <p className="text-xs text-emerald-200/80">
                    {list.length} unit{list.length > 1 ? "s" : ""} in view
                  </p>
                </div>
                <span className="pill text-[0.7rem]">Category: {category}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-xs md:text-sm">
                  <thead className="bg-emerald-950/80">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-emerald-300 uppercase tracking-wide">
                        Model
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-emerald-300 uppercase tracking-wide">
                        Type
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-emerald-300 uppercase tracking-wide">
                        Country
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-emerald-300 uppercase tracking-wide">
                        Notes
                      </th>
                      {!readOnly && (
                        <th className="px-4 py-2 text-left font-semibold text-emerald-300 uppercase tracking-wide">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-500/20">
                    {list.map((v) => (
                      <tr
                        key={v._id}
                        className="hover:bg-emerald-900/40 transition-colors"
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-emerald-50">
                          {v.name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 inline-flex text-[0.7rem] leading-5 font-semibold rounded-full bg-sky-500/15 text-sky-200 border border-sky-400/50 capitalize">
                            {v.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-emerald-100/80">
                          {v.country}
                        </td>
                        {/* Notes: now fully visible, wrapped */}
                        <td className="px-4 py-3 text-emerald-100/80">
                          <div className="whitespace-normal leading-snug">
                            {v.specifications?.notes || v.description || "—"}
                          </div>
                        </td>

                        {!readOnly && (
                          <td className="px-4 py-3 whitespace-nowrap text-xs font-medium">
                            <button
                              onClick={() => onEdit && onEdit(v)}
                              className="mr-3 rounded-full bg-indigo-600/80 px-3 py-1 text-[0.7rem] font-semibold text-white border border-indigo-300 shadow-[0_0_14px_rgba(79,70,229,0.9)] hover:bg-indigo-400 hover:border-indigo-200 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => onDelete && onDelete(v._id)}
                              className="rounded-full bg-red-600/80 px-3 py-1 text-[0.7rem] font-semibold text-white border border-red-300 shadow-[0_0_14px_rgba(248,113,113,0.9)] hover:bg-red-500 hover:border-red-200 transition"
                            >
                              Delete
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VehicleList;
