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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify OTP
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the OTP sent to your registered phone
          </p>
        </div>
        <OtpForm />
      </div>
    </div>
  );
};

export default OtpPage;
