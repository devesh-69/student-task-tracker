const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { authMiddleware } = require("../middleware/auth");

// All routes require authentication
router.use(authMiddleware);

// GET user profile (current authenticated user)
router.get("/", async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE user profile
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
      return res
        .status(400)
        .json({ error: "Name must be at least 2 characters" });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name: name.trim(), hasOnboarded: true },
      { new: true },
    ).select("-password");

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE user account (for clear data - just clears tasks/logs, not the account)
router.delete("/", async (req, res) => {
  try {
    // Note: This doesn't delete the user account, just signals data clear
    // The actual task deletion is handled by the tasks route
    res.json({ message: "User data clear signal received" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
