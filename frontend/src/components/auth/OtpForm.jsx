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
        // Login successful
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
    // For now, just show message. You can implement resend logic later.
    alert("Please use the same OTP or check your phone for new OTP");
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="otp"
          className="block text-sm font-medium text-gray-700"
        >
          OTP Code
        </label>
        <input
          id="otp"
          name="otp"
          type="text"
          required
          maxLength="6"
          className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
        />
      </div>

      <div className="flex flex-col space-y-4">
        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <button
          type="button"
          onClick={handleResendOtp}
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          Resend OTP
        </button>
      </div>
    </form>
  );
};

export default OtpForm;
