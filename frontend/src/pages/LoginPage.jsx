import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginForm from "../components/auth/LoginForm";

const LoginPage = () => {
  const { admin } = useAuth();

  if (admin) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="flex items-center justify-center py-16">
      <div className="glass-card max-w-md w-full p-8 space-y-6 bg-slate-950/95">
        <div className="text-center">
          <p className="section-label text-emerald-300/90">Secure Access</p>
          <h2 className="mt-2 text-3xl font-extrabold text-lime-300 drop-shadow-[0_0_20px_rgba(190,242,100,0.9)]">
            Military Intelligence Node
          </h2>
          <p className="mt-3 text-sm text-emerald-100">
            Admin login with two-step verification.
          </p>
        </div>

        {/* Login form */}
        <div className="space-y-4">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
