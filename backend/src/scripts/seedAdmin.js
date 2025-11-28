import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import config from "../config/env.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      email: "girish@military.intel",
    });
    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit(0);
    }

    // Create admin with your credentials
    const hashedPassword = await bcrypt.hash("Girish@123", 12);

    const admin = new Admin({
      name: "Girish",
      phone: "+1234567890", // Replace with actual phone number
      email: "girish@military.intel",
      password: hashedPassword,
    });

    await admin.save();
    console.log("Admin created successfully:", {
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
    });

    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
