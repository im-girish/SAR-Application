import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { adminApi } from "../api/adminApi";

const AdminProfilePage = () => {
  const navigate = useNavigate();
  const { admin } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    username: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Load admin data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await adminApi.getProfile();
        if (response.data.data) {
          const profileData = response.data.data;
          setFormData({
            email: profileData.email || "",
            phone: profileData.phone || "",
            username: profileData.username || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        // Fallback to localStorage if API fails
        if (admin) {
          setFormData({
            email: admin.email || "",
            phone: admin.phone || "",
            username: admin.username || "",
          });
        }
      }
    };

    if (admin) {
      fetchProfile();
    }
  }, [admin]);

  // Handle profile form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle password form changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await adminApi.updateProfile({
        email: formData.email,
        phone: formData.phone,
        username: formData.username,
      });

      toast.success("✅ Profile updated successfully!");
      setEditMode(false);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to update profile";
      toast.error(errorMsg);
      console.error("Update error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    setPasswordLoading(true);

    try {
      await adminApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success("✅ Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 px-2 sm:px-4">
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate("/dashboard")}
        className="px-4 sm:px-6 py-2 rounded-full bg-purple-700/80 text-purple-100 text-xs sm:text-sm
                   border border-purple-400 shadow-[0_0_22px_rgba(168,85,247,0.9)]"
      >
        ← Back to Dashboard
      </button>

      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-lime-300">
        👤 Admin Profile
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10">
        {/* PROFILE SECTION */}
        <div className="glass-card p-4 sm:p-6 md:p-8 border border-emerald-500/40 space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-emerald-200">
              Profile Information
            </h2>
            <button
              onClick={() => setEditMode(!editMode)}
              className="px-3 sm:px-4 py-1 sm:py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold w-full sm:w-auto"
            >
              {editMode ? "✕ Cancel" : "✏️ Edit"}
            </button>
          </div>

          <form
            onSubmit={handleUpdateProfile}
            className="space-y-3 sm:space-y-4"
          >
            {/* EMAIL (EDITABLE) */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-emerald-300 mb-1 sm:mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!editMode}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-emerald-500/40 bg-slate-950/85
                           text-emerald-50 disabled:opacity-60 disabled:cursor-not-allowed
                           focus:outline-none focus:ring-2 focus:ring-emerald-400/80"
              />
            </div>

            {/* USERNAME (EDITABLE) */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-emerald-300 mb-1 sm:mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={!editMode}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-emerald-500/40 bg-slate-950/85
                           text-emerald-50 disabled:opacity-60 disabled:cursor-not-allowed
                           focus:outline-none focus:ring-2 focus:ring-emerald-400/80"
              />
            </div>

            {/* PHONE */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-emerald-300 mb-1 sm:mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!editMode}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-emerald-500/40 bg-slate-950/85
                           text-emerald-50 disabled:opacity-60 disabled:cursor-not-allowed
                           focus:outline-none focus:ring-2 focus:ring-emerald-400/80"
              />
            </div>

            {/* SAVE BUTTON */}
            {editMode && (
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm
                           font-semibold disabled:opacity-60 transition-all"
              >
                {loading ? "💾 Saving..." : "💾 Save Changes"}
              </button>
            )}
          </form>
        </div>

        {/* PASSWORD & SECURITY SECTION */}
        <div className="glass-card p-4 sm:p-6 md:p-8 border border-yellow-500/30 space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-yellow-200">
            🔐 Security Settings
          </h2>

          {!showPasswordForm ? (
            <div className="space-y-2 sm:space-y-3">
              <button
                onClick={() => setShowPasswordForm(true)}
                className="w-full py-2 sm:py-3 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white text-sm sm:text-base
                           font-semibold transition-all"
              >
                🔑 Change Password
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full py-2 sm:py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm sm:text-base
                           font-semibold transition-all"
              >
                Next →
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleChangePassword}
              className="space-y-3 sm:space-y-4"
            >
              {/* CURRENT PASSWORD */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-yellow-300 mb-1 sm:mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-yellow-500/40 bg-slate-950/85
                             text-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400/80"
                  placeholder="Enter your current password"
                />
              </div>

              {/* NEW PASSWORD */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-yellow-300 mb-1 sm:mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-yellow-500/40 bg-slate-950/85
                             text-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400/80"
                  placeholder="Enter new password (min 8 characters)"
                />
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-yellow-300 mb-1 sm:mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-yellow-500/40 bg-slate-950/85
                             text-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400/80"
                  placeholder="Confirm new password"
                />
              </div>

              {/* BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm
                             font-semibold disabled:opacity-60 transition-all"
                >
                  {passwordLoading ? "🔄 Updating..." : "✅ Update Password"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm
                             font-semibold transition-all"
                >
                  ✕ Cancel
                </button>
              </div>
            </form>
          )}

          {/* SECURITY INFO */}
          <div className="pt-4 border-t border-yellow-500/20 space-y-2">
            <p className="text-sm text-yellow-200">
              ✓ Last login: <span className="text-yellow-100">Recently</span>
            </p>
            <p className="text-sm text-yellow-200">
              ✓ 2-Step Verification:{" "}
              <span className="text-green-300">Enabled</span>
            </p>
            <p className="text-xs text-yellow-300 pt-2">
              💡 Keep your password strong and unique
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
