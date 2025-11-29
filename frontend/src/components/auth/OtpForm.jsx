import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../api/authApi";

const OtpForm = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const tempEmail = localStorage.getItem("tempEmail");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authApi.verifyOtp({
        email: tempEmail,
        otp: otp,
      });

      if (response.success) {
        login(response.data.admin, response.data.token);
        localStorage.removeItem("tempEmail");
        navigate("/dashboard");
      }
    } catch (error) {
      setError(error.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    alert("Please use the same OTP or check your phone for new OTP");
  };

  return (
    <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
      {error && (
        <div className="border border-red-500/70 bg-red-950/60 text-red-100 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="otp"
          className="block text-xs font-semibold text-emerald-200 uppercase tracking-wide"
        >
          OTP Code
        </label>
        <input
          id="otp"
          name="otp"
          type="text"
          required
          maxLength={6}
          className="mt-1 block w-full rounded-md border border-emerald-500/40 bg-slate-950/85 px-3 py-2 text-emerald-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/80"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
        />
      </div>

      <div className="flex flex-col space-y-3">
        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full flex justify-center py-2.5 px-4 text-sm font-semibold rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 shadow-[0_0_22px_rgba(79,70,229,0.9)] disabled:opacity-60"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <button
          type="button"
          onClick={handleResendOtp}
          className="text-xs text-emerald-300 hover:text-emerald-100 text-center"
        >
          Resend OTP
        </button>
      </div>
    </form>
  );
};

export default OtpForm;
