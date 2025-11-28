import dotenv from "dotenv";

dotenv.config();

export default {
  port: process.env.PORT || 5000,
  mongodbUri: process.env.MONGO_URI || "mongodb://localhost:27017/sar-app",
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: "7d",
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    verifyServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID,
  },
  news: {
    apiKey: process.env.NEWS_API_KEY,
    baseUrl: process.env.NEWS_API_BASE_URL,
  },
  admin: {
    defaultPhone: process.env.DEFAULT_ADMIN_PHONE,
    defaultEmail: process.env.DEFAULT_ADMIN_EMAIL,
    defaultPassword: process.env.DEFAULT_ADMIN_PASSWORD,
  },
};
