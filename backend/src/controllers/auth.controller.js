import Admin from "../models/Admin.js";
import { comparePassword } from "../services/auth.service.js";
import { sendOtp, verifyOtp } from "../services/otp.service.js";
import { generateToken } from "../utils/jwt.util.js";
import { successResponse, errorResponse } from "../utils/response.util.js";

// Store temporary tokens (in production, use Redis)
const tempTokenStore = new Map();

export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // email or username

    if (!identifier || !password) {
      return errorResponse(
        res,
        "Identifier (email or username) and password are required",
        400
      );
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
    console.log("FOUND ADMIN:", admin);

    if (!admin) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    // Check password
    const isPasswordValid = await comparePassword(password, admin.password);
    if (!isPasswordValid) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    // Generate temporary token for OTP step
    const tempToken = generateToken({
      id: admin._id,
      email: admin.email,
      step: "otp_required",
    });

    // Store temp data keyed by email
    tempTokenStore.set(admin.email, {
      adminId: admin._id,
      phone: admin.phone,
    });

    // Send OTP to admin's phone
    const otpResult = await sendOtp(admin.phone);
    if (!otpResult.success) {
      return errorResponse(res, "Failed to send OTP", 500);
    }

    return successResponse(res, {
      tempToken,
      message: "OTP sent to your registered phone number",
    });
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse(res, "Login failed", 500);
  }
};

export const verifyOtpAndLogin = async (req, res) => {
  try {
    const { identifier, otp } = req.body; // identifier used again

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

    // Verify OTP with Twilio
    const otpResult = await verifyOtp(tempData.phone, otp);
    if (!otpResult.success) {
      return errorResponse(res, "Invalid OTP", 400);
    }

    // Get admin data
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
      "Login successful"
    );
  } catch (error) {
    console.error("OTP verification error:", error);
    return errorResponse(res, "OTP verification failed", 500);
  }
};
