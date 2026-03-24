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
  const [passwordError, setPasswordError] = useState("");

  // 🔐 Password Validation Function
  const validatePassword = (password, username, email) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }

    if (!/[A-Z]/.test(password)) {
      return "Must include at least one uppercase letter";
    }

    if (!/[a-z]/.test(password)) {
      return "Must include at least one lowercase letter";
    }

    if (!/[0-9]/.test(password)) {
      return "Must include at least one number";
    }

    if (!/[!@#$%^&*(),.?\":{}|<>_+=-]/.test(password)) {
      return "Must include at least one special character";
    }

    if (username && password.toLowerCase().includes(username.toLowerCase())) {
      return "Password should not contain username";
    }

    if (email && password.toLowerCase().includes(email.toLowerCase())) {
      return "Password should not contain email";
    }

    return "";
  };

  // 🔄 Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 🔥 Live password validation
    if (name === "password") {
      const msg = validatePassword(value, formData.username, formData.email);
      setPasswordError(msg);
    }
  };

  // 🚀 Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    // 🔥 Final password validation before API call
    const passwordValidation = validatePassword(
      formData.password,
      formData.username,
      formData.email,
    );

    if (passwordValidation) {
      setPasswordError(passwordValidation);
      setLoading(false);
      return;
    }

    try {
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

        setPasswordError("");
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

        {/* ✅ Success */}
        {message && <p className="text-green-400 mb-3">{message}</p>}

        {/* ❌ Backend Error */}
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

          {/* Phone */}
          <div className="flex gap-2">
            <select
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              className="bg-slate-900 border border-emerald-500/40 rounded-md px-2 py-2 text-white"
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
              className="flex-1 bg-slate-900 border border-emerald-500/40 rounded-md px-3 py-2 text-white"
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
            className="w-full bg-slate-900 border border-emerald-500/40 rounded-md px-3 py-2 text-white"
          />

          {/* 🔐 Password Rule Message */}
          {passwordError && (
            <p className="text-yellow-400 text-sm">{passwordError}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-md transition"
          >
            {loading ? "Creating..." : "Create Admin"}
          </button>
        </form>

        {/* Back */}
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
