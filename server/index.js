const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection event handlers
mongoose.connection.on("connected", () => {
  console.log("✅ Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("⚠️  Mongoose disconnected");
});

// Auth Routes (public - no auth required)
app.use("/api/auth", require("./routes/auth"));

// Protected Routes (require authentication)
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/user", require("./routes/user"));
app.use("/api/apikey", require("./routes/apikey"));
app.use("/api/logs", require("./routes/logs"));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Connect to MongoDB and then start server
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      family: 4,
    });
    console.log("✅ Connected to MongoDB");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    console.log(
      "⚠️  Please check your MongoDB Atlas IP Whitelist and Connection String",
    );
    process.exit(1);
  }
};

startServer();
