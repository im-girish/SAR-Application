// D:\SAR-APP\frontend\src\pages\OtpPage.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import OtpForm from "../components/auth/OtpForm";

const OtpPage = () => {
  const { admin } = useAuth();
  const tempEmail = localStorage.getItem("tempEmail");

  if (admin) {
    return <Navigate to="/dashboard" />;
  }

  if (!tempEmail) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex items-center justify-center py-16">
      <div className="glass-card max-w-md w-full p-8 space-y-6">
        <div className="text-center">
          <p className="section-label">Phase 2</p>
          <h2 className="mt-2 text-3xl font-extrabold text-lime-200">
            OTP Verification
          </h2>
          <p className="mt-2 text-sm text-emerald-100/80">
            Enter the one-time passcode sent to your secure channel.
          </p>
        </div>
        <OtpForm />
      </div>
    </div>
  );
};

export default OtpPage;
