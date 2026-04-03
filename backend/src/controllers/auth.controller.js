// D:\SAR-APP\backend\src\controllers\auth.controller.js

import Admin from "../models/Admin.js";
import { comparePassword } from "../services/auth.service.js";
import { sendOtp, verifyOtp } from "../services/otp.service.js";
import { generateToken } from "../utils/jwt.util.js";
import { successResponse, errorResponse } from "../utils/response.util.js";

// In production, replace with Redis or another store
const tempTokenStore = new Map();

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { identifier, password, otpMethod = "sms" } = req.body; // email or username

    if (!identifier || !password) {
      return errorResponse(
        res,
        "Identifier (email or username) and password are required",
        400,
      );
    }

    if (!["sms", "email"].includes(otpMethod)) {
      return errorResponse(res, "OTP method must be 'sms' or 'email'", 400);
    }

    const normalizedIdentifier = identifier.trim();

    // Find admin by email OR username (case-insensitive for username)
    const admin = await Admin.findOne({
      $or: [
        { email: normalizedIdentifier.toLowerCase() },
        { username: normalizedIdentifier },
        { username: new RegExp(`^${normalizedIdentifier}$`, "i") },
      ],
    });

    console.log("LOGIN IDENTIFIER:", normalizedIdentifier);
    console.log("FOUND ADMIN:", !!admin);
    console.log("OTP METHOD:", otpMethod);

    if (!admin) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    // Check password
    const isPasswordValid = await comparePassword(password, admin.password);
    if (!isPasswordValid) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    // Generate temporary token for OTP step (optional for client)
    const tempToken = generateToken({
      id: admin._id,
      email: admin.email,
      step: "otp_required",
    });

    // Determine OTP destination based on method
    const otpDestination = otpMethod === "email" ? admin.email : admin.phone;

    // Store temp data keyed by email
    tempTokenStore.set(admin.email, {
      adminId: admin._id,
      phone: admin.phone,
      email: admin.email,
      otpMethod: otpMethod,
    });

    // Send OTP using selected method
    const otpResult = await sendOtp(otpDestination, otpMethod);
    if (!otpResult.success) {
      return errorResponse(res, `Failed to send OTP via ${otpMethod}`, 500);
    }

    const message =
      otpMethod === "email"
        ? `OTP sent to your registered email: ${admin.email}`
        : `OTP sent to your registered phone: ${admin.phone}`;

    return successResponse(
      res,
      {
        tempToken,
        otpSent: true,
        otpMethod: otpMethod,
        destination: otpMethod === "email" ? admin.email : admin.phone,
      },
      message,
    );
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse(res, "Login failed", 500);
  }
};

// POST /api/auth/verify-otp
export const verifyOtpAndLogin = async (req, res) => {
  try {
    const { identifier, otp } = req.body;

    if (!identifier || !otp) {
      return errorResponse(res, "Identifier and OTP are required", 400);
    }

    const normalizedIdentifier = identifier.trim();

    // Look up by email OR username again
    const adminRecord = await Admin.findOne({
      $or: [
        { email: normalizedIdentifier.toLowerCase() },
        { username: normalizedIdentifier },
        { username: new RegExp(`^${normalizedIdentifier}$`, "i") },
      ],
    });

    if (!adminRecord) {
      return errorResponse(res, "Session expired. Please login again.", 400);
    }

    const tempData = tempTokenStore.get(adminRecord.email);
    if (!tempData) {
      return errorResponse(res, "Session expired. Please login again.", 400);
    }

    // Verify OTP using the same method that was used to send it
    const otpDestination =
      tempData.otpMethod === "email" ? tempData.email : tempData.phone;
    const otpResult = await verifyOtp(otpDestination, otp, tempData.otpMethod);

    if (!otpResult.success) {
      return errorResponse(res, "Invalid or expired OTP", 400);
    }

    // Get fresh admin data
    const admin = await Admin.findById(tempData.adminId);

    // Generate final access token
    const token = generateToken({
      id: admin._id,
      email: admin.email,
      name: admin.name,
    });

    // Clear temp data
    tempTokenStore.delete(admin.email);

    return successResponse(
      res,
      {
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
        },
      },
      "Login successful",
    );
  } catch (error) {
    console.error("OTP verification error:", error);
    return errorResponse(res, "OTP verification failed", 500);
  }
};

// GET /api/auth/profile
// Get current admin profile data
export const getProfile = async (req, res) => {
  try {
    const adminId = req.admin?.id; // From JWT middleware

    if (!adminId) {
      return errorResponse(res, "Not authenticated", 401);
    }

    const admin = await Admin.findById(adminId).select(
      "id name email phone username createdAt",
    );

    if (!admin) {
      return errorResponse(res, "Admin not found", 404);
    }

    return successResponse(
      res,
      {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        username: admin.username,
        createdAt: admin.createdAt,
      },
      "Profile retrieved successfully",
    );
  } catch (error) {
    console.error("Get profile error:", error);
    return errorResponse(res, "Failed to retrieve profile", 500);
  }
};

// PUT /api/auth/profile
// Update admin profile (email, phone, username)
export const updateProfile = async (req, res) => {
  try {
    const adminId = req.admin?.id; // From JWT middleware
    const { email, phone, username } = req.body;

    if (!adminId) {
      return errorResponse(res, "Not authenticated", 401);
    }

    // Validate input
    if (!email || !phone || !username) {
      return errorResponse(res, "Email, phone, and username are required", 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return errorResponse(res, "Invalid email format", 400);
    }

    if (username.trim().length < 3) {
      return errorResponse(res, "Username must be at least 3 characters", 400);
    }

    if (phone.trim().length < 10) {
      return errorResponse(res, "Phone must be at least 10 characters", 400);
    }

    // Check if email already exists (excluding current admin)
    const existingEmail = await Admin.findOne({
      email: email.trim().toLowerCase(),
      _id: { $ne: adminId },
    });

    if (existingEmail) {
      return errorResponse(res, "Email already in use", 400);
    }

    // Check if username already exists (excluding current admin)
    const existingUsername = await Admin.findOne({
      username: username.trim(),
      _id: { $ne: adminId },
    });

    if (existingUsername) {
      return errorResponse(res, "Username already in use", 400);
    }

    const admin = await Admin.findByIdAndUpdate(
      adminId,
      {
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        username: username.trim(),
      },
      { new: true, runValidators: true },
    ).select("id email phone username");

    if (!admin) {
      return errorResponse(res, "Admin not found", 404);
    }

    return successResponse(
      res,
      {
        id: admin._id,
        email: admin.email,
        phone: admin.phone,
        username: admin.username,
      },
      "Profile updated successfully",
    );
  } catch (error) {
    console.error("Update profile error:", error);
    return errorResponse(res, "Failed to update profile", 500);
  }
};

// POST /api/auth/change-password
// Change admin password
export const changePassword = async (req, res) => {
  try {
    const adminId = req.admin?.id; // From JWT middleware
    const { currentPassword, newPassword } = req.body;

    if (!adminId) {
      return errorResponse(res, "Not authenticated", 401);
    }

    // Validate input
    if (!currentPassword || !newPassword) {
      return errorResponse(
        res,
        "Current password and new password are required",
        400,
      );
    }

    if (newPassword.length < 8) {
      return errorResponse(
        res,
        "New password must be at least 8 characters",
        400,
      );
    }

    if (currentPassword === newPassword) {
      return errorResponse(
        res,
        "New password must be different from current password",
        400,
      );
    }

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return errorResponse(res, "Admin not found", 404);
    }

    // Verify current password
    const isPasswordValid = await comparePassword(
      currentPassword,
      admin.password,
    );

    if (!isPasswordValid) {
      return errorResponse(res, "Current password is incorrect", 401);
    }

    // Hash new password (Mongoose pre-save hook will handle this)
    admin.password = newPassword;
    await admin.save();

    return successResponse(res, {}, "Password changed successfully");
  } catch (error) {
    console.error("Change password error:", error);
    return errorResponse(res, "Failed to change password", 500);
  }
};
