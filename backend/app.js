import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./src/config/database.js";
import authRoutes from "./src/routes/auth.routes.js";
import vehicleRoutes from "./src/routes/vehicle.routes.js";
import newsRoutes from "./src/routes/news.routes.js";
import { authMiddleware } from "./src/middlewares/auth.middleware.js";
import detectRoute from "./src/routes/detect.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/ml", detectRoute);
app.use("/api/admin", adminRoutes);

// Protected test route
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "Access granted to protected route",
    admin: req.admin,
  });
});

// Basic route
app.get("/", (req, res) => {
  res.json({
    message: "Military Intelligence API is running!",
    endpoints: {
      auth: "/api/auth",
      vehicles: "/api/vehicles",
      news: "/api/news",
      protected: "/api/protected",
    },
  });
});

// Connect to database
connectDB()
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
