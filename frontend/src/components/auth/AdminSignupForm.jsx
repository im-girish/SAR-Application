import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api/authApi";

const AdminSignupForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    countryCode: "+91",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      // ✅ Combine country code + phone for Twilio format
      const payload = {
        username: formData.username,
        email: formData.email,
        phone: `${formData.countryCode}${formData.phone}`,
        password: formData.password,
      };

      const res = await authApi.adminSignup(payload);

      if (res.data?.success) {
        setMessage("Admin created successfully ✅");

        setFormData({
          username: "",
          email: "",
          countryCode: "+91",
          phone: "",
          password: "",
        });
      } else {
        setError(res.data?.message || "Signup failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen px-4">
      <div className="w-full max-w-md bg-black/70 backdrop-blur-md border border-emerald-500/40 rounded-xl p-8 shadow-[0_0_40px_rgba(16,185,129,0.4)]">
        <h2 className="text-center text-2xl font-bold text-emerald-300 mb-6">
          Create Admin Account
        </h2>

        {message && <p className="text-green-400 mb-3">{message}</p>}
        {error && <p className="text-red-400 mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <input
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full bg-slate-900 border border-emerald-500/40 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-emerald-400 outline-none"
          />

          {/* Email */}
          <input
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full bg-slate-900 border border-emerald-500/40 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-emerald-400 outline-none"
          />

          {/* Phone with Country Code */}
          <div className="flex gap-2">
            <select
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              className="bg-slate-900 border border-emerald-500/40 rounded-md px-2 py-2 text-white focus:ring-2 focus:ring-emerald-400 outline-none"
            >
              <option value="+91">+91 🇮🇳</option>
              <option value="+1">+1 🇺🇸</option>
              <option value="+44">+44 🇬🇧</option>
              <option value="+971">+971 🇦🇪</option>
            </select>

            <input
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
              className="flex-1 bg-slate-900 border border-emerald-500/40 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-emerald-400 outline-none"
            />
          </div>

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full bg-slate-900 border border-emerald-500/40 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-emerald-400 outline-none"
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-md transition"
          >
            {loading ? "Creating..." : "Create Admin"}
          </button>
        </form>

        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="mt-5 w-full text-sm text-emerald-300 hover:underline"
        >
          ← Back to Command Center
        </button>
      </div>
    </div>
  );
};

export default AdminSignupForm;
