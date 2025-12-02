import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api/authApi";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authApi.login(formData);

      if (response.success) {
        localStorage.setItem("tempEmail", formData.identifier);
        navigate("/otp");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
      {error && (
        <div className="border border-red-500/70 bg-red-950/60 text-red-100 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label
            htmlFor="identifier"
            className="block text-xs font-semibold text-emerald-200 uppercase tracking-wide"
          >
            Email or Username
          </label>
          <input
            id="identifier"
            name="identifier"
            type="text"
            required
            className="mt-1 block w-full rounded-md border border-emerald-500/40 bg-slate-950/85 px-3 py-2 text-emerald-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/80"
            placeholder="Email Or Username"
            value={formData.identifier}
            onChange={handleChange}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-semibold text-emerald-200 uppercase tracking-wide"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="mt-1 block w-full rounded-md border border-emerald-500/40 bg-slate-950/85 px-3 py-2 text-emerald-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/80"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="group relative w-full flex justify-center py-2.5 px-4 text-sm font-semibold rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 shadow-[0_0_22px_rgba(79,70,229,0.9)] disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
