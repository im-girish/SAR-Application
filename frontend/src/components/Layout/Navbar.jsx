import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-30">
      <div className="mx-auto max-w-6xl px-4 md:px-0 pt-3">
        <nav className="flex items-center justify-between gap-6 rounded-3xl border border-emerald-500/40 bg-slate-950/80 shadow-[0_18px_50px_rgba(0,0,0,0.9)] px-4 py-3 md:px-6 backdrop-blur">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-full border border-emerald-400/90 bg-emerald-500/20 shadow-[0_0_22px_rgba(16,185,129,0.95)] group-hover:shadow-[0_0_32px_rgba(16,185,129,1)] transition-shadow" />
            <div className="leading-tight">
              <div className="text-[0.6rem] tracking-[0.32em] uppercase text-emerald-300/85">
                SARSAT
              </div>
              <div className="text-sm font-semibold text-emerald-50">
                Military Intelligence
              </div>
            </div>
          </Link>

          {/* Center nav */}
          <nav className="hidden md:flex items-center gap-3 text-xs">
            <Link
              to="/news"
              className={`px-3 py-1 rounded-full border transition ${
                isActive("/news")
                  ? "bg-emerald-500/30 border-emerald-300 text-emerald-50 shadow-[0_0_15px_rgba(16,185,129,0.9)]"
                  : "bg-slate-900 border-transparent text-emerald-200 hover:border-emerald-400/70 hover:bg-emerald-500/15"
              }`}
            >
              News
            </Link>

            {admin && (
              <Link
                to="/dashboard"
                className={`px-3 py-1 rounded-full border transition ${
                  isActive("/dashboard")
                    ? "bg-emerald-500/30 border-emerald-300 text-emerald-50 shadow-[0_0_15px_rgba(16,185,129,0.9)]"
                    : "bg-slate-900 border-transparent text-emerald-200 hover:border-emerald-400/70 hover:bg-emerald-500/15"
                }`}
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* Right: status + auth */}
          <div className="flex items-center gap-3 text-xs">
            <div className="hidden sm:flex items-center gap-2 text-emerald-300/80">
              <span className="status-dot" />
              <span className="tracking-[0.25em] uppercase">Operational</span>
            </div>

            {admin ? (
              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/80 text-emerald-50 hover:bg-emerald-500/35 text-xs font-semibold shadow-[0_0_18px_rgba(16,185,129,0.8)]"
              >
                Logout ({admin.name})
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
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
