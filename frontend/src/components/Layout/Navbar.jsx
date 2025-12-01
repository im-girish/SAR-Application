import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import indiaFlag from "../../assets/Flag_of_India.svg.webp";

const Navbar = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-30">
      <div className="w-full bg-slate-950/90 border-b border-emerald-500/40 shadow-[0_10px_40px_rgba(0,0,0,0.9)]">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-6">
          {/* Left brand with India flag */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative h-10 w-10 rounded-full border border-emerald-400/90 bg-emerald-500/10 shadow-[0_0_22px_rgba(16,185,129,0.95)] group-hover:shadow-[0_0_32px_rgba(16,185,129,1)] transition-shadow overflow-hidden">
              <img
                src={indiaFlag}
                alt="India flag"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="leading-tight">
              <div className="text-[0.6rem] tracking-[0.32em] uppercase text-emerald-300/85">
                SARSAT
              </div>
              <div className="text-sm font-semibold text-emerald-50">
                Military Intelligence
              </div>
            </div>
          </Link>

          {/* Center menu */}
          <nav className="flex items-center gap-4 text-xs">
            <Link
              to="/"
              className={`px-3 py-1 rounded-full ${
                isActive("/")
                  ? "bg-emerald-500/30 text-emerald-50 shadow-[0_0_15px_rgba(16,185,129,0.9)]"
                  : "text-emerald-200 hover:bg-emerald-500/15"
              }`}
            >
              Command Center
            </Link>

            {admin && (
              <Link
                to="/vehicles"
                className={`px-3 py-1 rounded-full ${
                  isActive("/vehicles")
                    ? "bg-emerald-500/30 text-emerald-50 shadow-[0_0_15px_rgba(16,185,129,0.9)]"
                    : "text-emerald-200 hover:bg-emerald-500/15"
                }`}
              >
                Military Vehicles
              </Link>
            )}

            {admin && (
              <Link
                to="/dashboard"
                className={`px-3 py-1 rounded-full ${
                  isActive("/dashboard")
                    ? "bg-emerald-500/30 text-emerald-50 shadow-[0_0_15px_rgba(16,185,129,0.9)]"
                    : "text-emerald-200 hover:bg-emerald-500/15"
                }`}
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* Right status / auth */}
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-2 text-lime-300">
              <span className="status-dot" />
              OPERATIONAL
            </span>

            {admin ? (
              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/80 text-emerald-50 hover:bg-emerald-500/35 text-xs font-semibold shadow-[0_0_18px_rgba(16,185,129,0.8)]"
              >
                Logout ({admin.username || "Admin"})
              </button>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-[0_0_18px_rgba(79,70,229,0.9)]"
              >
                Admin Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
