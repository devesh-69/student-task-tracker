// Netlify Serverless Function - API Handler
const serverless = require("serverless-http");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware - Allow all origins for cross-network/device access
app.use(
  cors({
    origin: true, // Allow any origin
    credentials: true,
  }),
);
app.use(express.json());

// MongoDB connection singleton
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("Using existing MongoDB connection");
    return;
  }

  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error("MONGODB_URI not found in environment variables");
    }

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
};

// Import routes
const authRoutes = require("../../server/routes/auth");
const taskRoutes = require("../../server/routes/tasks");
const userRoutes = require("../../server/routes/user");
const apiKeyRoutes = require("../../server/routes/apikey");

// Mount routes
// Note: Netlify rewrites /api/* to this function, but the path seen by Express includes /api
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/tasks", taskRoutes);
router.use("/user", userRoutes);
router.use("/apikey", apiKeyRoutes);

// Mount // Mount router at /api
app.use("/api", router);

// Also support direct function calls
app.use("/.netlify/functions/api", router);

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    mongodb: isConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Connect to DB before handling requests
const handler = async (event, context) => {
  // Prevent Lambda from timing out
  context.callbackWaitsForEmptyEventLoop = false;

  // Connect to DB
  await connectDB();

  // Handle request with Express
  return serverless(app)(event, context);
};

module.exports.handler = handler;
