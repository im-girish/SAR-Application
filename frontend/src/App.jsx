// D:\SAR-APP\frontend\src\App.jsx

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import LoginPage from "./pages/LoginPage";
import OtpPage from "./pages/OtpPage";
import AdminDashboard from "./pages/AdminDashboard";
import PublicNewsPage from "./pages/PublicNewsPage";
import VehicleDetailsPage from "./pages/VehicleDetailsPage";
import VehiclesPage from "./pages/VehiclesPage";
import SarDetectionPage from "./pages/SarDetectionPage";
import AdminSignupPage from "./pages/AdminSignupPage"; // ✅ signup page
import AdminProfilePage from "./pages/AdminProfilePage"; // ✅ profile page

// Layout
import AppLayout from "./components/layout/AppLayout";

// 🔐 Protected Route
const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-emerald-100">
        Loading...
      </div>
    );
  }

  return admin ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout>
          <Routes>
            {/* ================= AUTH ROUTES ================= */}

            <Route path="/login" element={<LoginPage />} />
            <Route path="/otp" element={<OtpPage />} />

            {/* 🔥 NEW ADMIN SIGNUP ROUTE */}
            <Route path="/admin-signup" element={<AdminSignupPage />} />

            {/* ================= PUBLIC ROUTES ================= */}

            <Route path="/" element={<PublicNewsPage />} />

            {/* ================= PROTECTED ROUTES ================= */}

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <AdminProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vehicles"
              element={
                <ProtectedRoute>
                  <VehiclesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vehicles/:id"
              element={
                <ProtectedRoute>
                  <VehicleDetailsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/sar-detection"
              element={
                <ProtectedRoute>
                  <SarDetectionPage />
                </ProtectedRoute>
              }
            />

            {/* ================= FALLBACK ================= */}

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </AuthProvider>
  );
}

export default App;
