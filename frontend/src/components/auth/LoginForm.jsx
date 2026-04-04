import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api/authApi";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    otpMethod: "sms", // SMS or Email
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.identifier || !formData.password) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await authApi.login({
        identifier: formData.identifier,
        password: formData.password,
        otpMethod: formData.otpMethod,
      });

      console.log("LOGIN RESPONSE", response.data);

      if (response?.data?.success) {
        // ✅ Save temp token (OTP flow)
        if (response.data.data?.tempToken) {
          localStorage.setItem("tempToken", response.data.data.tempToken);
        }

        // Save identifier and OTP method
        localStorage.setItem("tempEmail", formData.identifier);
        localStorage.setItem("otpMethod", formData.otpMethod);
        localStorage.setItem("otpDestination", response.data.data?.destination);

        navigate("/otp");
      } else {
        setError(response?.data?.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);

      setError(err?.response?.data?.message || err.message || "Login failed");
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
        {/* IDENTIFIER */}
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
            value={formData.identifier}
            onChange={handleChange}
            placeholder="Email Or Username"
            className="mt-1 block w-full rounded-md border border-emerald-500/40 bg-slate-950/85 px-3 py-2 text-emerald-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/80"
          />
        </div>

        {/* PASSWORD */}
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-semibold text-emerald-200 uppercase tracking-wide"
          >
            Password
          </label>

          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="mt-1 block w-full rounded-md border border-emerald-500/40 bg-slate-950/85 px-3 py-2 pr-10 text-emerald-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/80"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-300 hover:text-emerald-100"
            >
              {showPassword ? "👁️" : "🔒"}
            </button>
          </div>
        </div>

        {/* OTP METHOD SELECTION */}
        <div>
          <label className="block text-xs font-semibold text-emerald-200 uppercase tracking-wide mb-3">
            📨 OTP Delivery Method
          </label>
          <div className="flex gap-4">
            {/* SMS Option */}
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="otpMethod"
                value="sms"
                checked={formData.otpMethod === "sms"}
                onChange={handleChange}
                className="w-4 h-4 text-indigo-600 accent-indigo-600"
              />
              <span className="ml-2 text-sm text-emerald-100">
                📱 SMS (Phone)
              </span>
            </label>

            {/* Email Option */}
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="otpMethod"
                value="email"
                checked={formData.otpMethod === "email"}
                onChange={handleChange}
                className="w-4 h-4 text-indigo-600 accent-indigo-600"
              />
              <span className="ml-2 text-sm text-emerald-100">
                ✉️ Email (Gmail)
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* LOGIN BUTTON */}
      <button
        type="submit"
        disabled={loading}
        className="group relative w-full flex justify-center py-2.5 px-4 text-sm font-semibold rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 shadow-[0_0_22px_rgba(79,70,229,0.9)] disabled:opacity-60"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      {/* ADMIN SIGNUP LINK (NEW ADDED) */}
      <div className="text-center mt-3">
        <p className="text-sm text-slate-300">
          Need admin access?{" "}
          <span
            onClick={() => navigate("/admin-signup")}
            className="text-indigo-400 cursor-pointer hover:underline"
          >
            Create Admin Account
          </span>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;
