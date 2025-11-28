import twilio from "twilio";
import config from "../config/env.js";

const client = twilio(config.twilio.accountSid, config.twilio.authToken);

export const sendOtp = async (phoneNumber) => {
  try {
    console.log("🔧 Sending OTP to:", phoneNumber);
    console.log("🔧 Using Verify Service SID:", config.twilio.verifyServiceSid);

    const verification = await client.verify.v2
      .services(config.twilio.verifyServiceSid)
      .verifications.create({ to: phoneNumber, channel: "sms" });

    console.log("✅ OTP sent via Twilio Verify");
    return { success: true, sid: verification.sid };
  } catch (error) {
    console.error("❌ Twilio Verify Error:", error.message);
    return { success: false, error: error.message };
  }
};

export const verifyOtp = async (phoneNumber, code) => {
  try {
    const verificationCheck = await client.verify.v2
      .services(config.twilio.verifyServiceSid)
      .verificationChecks.create({ to: phoneNumber, code });

    return {
      success: verificationCheck.status === "approved",
      status: verificationCheck.status,
    };
  } catch (error) {
    console.error("❌ OTP Verification Error:", error.message);
    return { success: false, error: error.message };
  }
};
