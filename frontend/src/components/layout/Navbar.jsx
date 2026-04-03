import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
// import indiaFlag from "../../assets/Flag_of_India.svg.webp";
import indiaFlag from "../../assets/India.jpeg";

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
        <div className="mx-auto max-w-6xl px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 md:gap-6">
          {/* Left brand with FIXED ROUND FLAG */}
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-3 group flex-shrink-0"
          >
            <div
              className="
                h-8 sm:h-10
                w-8 sm:w-10
                rounded-full
                overflow-hidden
                border border-emerald-400/90
                bg-emerald-500/10
                shadow-[0_0_22px_rgba(16,185,129,0.95)]
                group-hover:shadow-[0_0_32px_rgba(16,185,129,1)]
                transition-shadow
                flex items-center justify-center
                flex-shrink-0
              "
            >
              <img
                src={indiaFlag}
                alt="India Flag"
                className="
                  h-full w-full
                  object-cover
                  rounded-full
                "
              />
            </div>

            <div className="leading-tight hidden sm:block">
              <div className="text-[0.5rem] sm:text-[0.6rem] tracking-[0.32em] uppercase text-emerald-300/85">
                SARSAT
              </div>
              <div className="text-xs sm:text-sm font-semibold text-emerald-50">
                Military Intelligence
              </div>
            </div>
          </Link>

          {/* Center menu - hidden on very small screens */}
          <nav className="hidden md:flex items-center gap-2 text-xs lg:gap-4">
            <Link
              to="/"
              className={`px-2 lg:px-3 py-1 rounded-full text-xs ${
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
                className={`px-2 lg:px-3 py-1 rounded-full text-xs ${
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
                className={`px-2 lg:px-3 py-1 rounded-full text-xs ${
                  isActive("/dashboard")
                    ? "bg-emerald-500/30 text-emerald-50 shadow-[0_0_15px_rgba(16,185,129,0.9)]"
                    : "text-emerald-200 hover:bg-emerald-500/15"
                }`}
              >
                Dashboard
              </Link>
            )}

            {admin && (
              <Link
                to="/profile"
                className={`px-2 lg:px-3 py-1 rounded-full text-xs ${
                  isActive("/profile")
                    ? "bg-yellow-500/30 text-yellow-50 shadow-[0_0_15px_rgba(234,179,8,0.9)]"
                    : "text-yellow-200 hover:bg-yellow-500/15"
                }`}
              >
                Profile
              </Link>
            )}

            {admin && (
              <Link
                to="/sar-detection"
                className={`px-3 py-1 rounded-full ${
                  isActive("/sar-detection")
                    ? "bg-lime-500/40 text-lime-50 shadow-[0_0_18px_rgba(163,230,53,1)]"
                    : "text-lime-200 hover:bg-lime-500/20"
                }`}
              >
                SAR Detection
              </Link>
            )}
          </nav>

          {/* Right status / auth */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 text-xs md:text-base">
            <span className="hidden sm:flex items-center gap-2 text-lime-300 text-xs">
              <span className="status-dot" />
              <span className="hidden md:inline">OPERATIONAL</span>
            </span>

            {admin ? (
              <button
                onClick={handleLogout}
                className="px-2 sm:px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/80 text-emerald-50 hover:bg-emerald-500/35 text-xs font-semibold shadow-[0_0_18px_rgba(16,185,129,0.8)] whitespace-nowrap"
              >
                Logout {admin.username && `(${admin.username})`}
              </button>
            ) : (
              <Link
                to="/login"
                className="px-2 sm:px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-[0_0_18px_rgba(79,70,229,0.9)] whitespace-nowrap"
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
