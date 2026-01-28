const express = require("express");
const router = express.Router();
const ActivityLog = require("../models/ActivityLog");
const { authMiddleware } = require("../middleware/auth");

// All routes require authentication
router.use(authMiddleware);

// GET all activity logs for current user
router.get("/", async (req, res) => {
  try {
    const logs = await ActivityLog.find({ userId: req.userId })
      .sort({ timestamp: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET logs for specific task (owned by current user)
router.get("/:taskId", async (req, res) => {
  try {
    const logs = await ActivityLog.find({
      taskId: req.params.taskId,
      userId: req.userId,
    }).sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
