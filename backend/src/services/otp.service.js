import twilio from "twilio";
import nodemailer from "nodemailer";
import config from "../config/env.js";

const twilioClient = twilio(config.twilio.accountSid, config.twilio.authToken);

// Initialize Nodemailer transporter
const emailTransporter = nodemailer.createTransport({
  service: config.email.service,
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
});
// ✅ FIXED (production-safe)
// const emailTransporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true, // true for 465
//   auth: {
//     user: config.email.user,
//     pass: config.email.password,
//   },
// });

/**
 * Generate a random 6-digit OTP
 */
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Store OTP in memory (use Redis in production)
 */
const otpStore = new Map();

/**
 * Send OTP via SMS (Twilio)
 */
export const sendOtpViaSms = async (phoneNumber) => {
  try {
    console.log("📱 Sending OTP via SMS to:", phoneNumber);

    const verification = await twilioClient.verify.v2
      .services(config.twilio.verifyServiceSid)
      .verifications.create({ to: phoneNumber, channel: "sms" });

    console.log("✅ OTP sent via SMS");
    return { success: true, method: "sms", sid: verification.sid };
  } catch (error) {
    console.error("❌ SMS OTP Error:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send OTP via Email (Gmail/Nodemailer)
 */
export const sendOtpViaEmail = async (email) => {
  try {
    console.log("📧 Sending OTP via Email to:", email);

    const otp = generateOtp();
    otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 }); // 10 min expiry

    const mailOptions = {
      from: config.email.from,
      to: email,
      subject: "SAR Detection App - OTP Verification",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h2 style="color: #333;">SAR Detection Verification</h2>
            <p style="color: #666;">Your One-Time Password (OTP) for login is:</p>
            <div style="background-color: #007bff; color: white; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
              <h1 style="margin: 0; letter-spacing: 3px;">${otp}</h1>
            </div>
            <p style="color: #999; font-size: 12px;">This OTP is valid for 10 minutes.</p>
            <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
          </div>
        </div>
      `,
    };

    // await emailTransporter.sendMail(mailOptions);
    // await emailTransporter.verify(); // 👈 ADD THIS LINE
    await emailTransporter.sendMail(mailOptions);
    console.log("✅ OTP sent via Email");
    return { success: true, method: "email", otp };
  } catch (error) {
    // console.error("❌ Email OTP Error:", error.message);
    console.error("❌ FULL Email OTP Error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Send OTP (Auto-select or specify method)
 */
export const sendOtp = async (phoneNumber, method = "sms") => {
  if (method === "email") {
    return sendOtpViaEmail(phoneNumber); // For email, this will be the email address
  }
  return sendOtpViaSms(phoneNumber);
};

/**
 * Verify OTP via SMS (Twilio Verify API)
 */
export const verifyOtpViaSms = async (phoneNumber, code) => {
  try {
    const verificationCheck = await twilioClient.verify.v2
      .services(config.twilio.verifyServiceSid)
      .verificationChecks.create({ to: phoneNumber, code });

    return {
      success: verificationCheck.status === "approved",
      status: verificationCheck.status,
    };
  } catch (error) {
    console.error("❌ SMS OTP Verification Error:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Verify OTP via Email (in-memory store)
 */
export const verifyOtpViaEmail = async (email, code) => {
  try {
    const stored = otpStore.get(email);

    if (!stored) {
      return { success: false, error: "OTP expired or not found" };
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(email);
      return { success: false, error: "OTP expired" };
    }

    if (stored.otp !== code.toString()) {
      return { success: false, error: "Invalid OTP" };
    }

    otpStore.delete(email);
    return { success: true };
  } catch (error) {
    console.error("❌ Email OTP Verification Error:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Verify OTP (dispatch to correct method)
 */
export const verifyOtp = async (phoneOrEmail, code, method = "sms") => {
  if (method === "email") {
    return verifyOtpViaEmail(phoneOrEmail, code);
  }
  return verifyOtpViaSms(phoneOrEmail, code);
};
