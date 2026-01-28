const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const ActivityLog = require("../models/ActivityLog");
const { authMiddleware } = require("../middleware/auth");

// All routes require authentication
router.use(authMiddleware);

// GET all tasks for current user
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId }).sort({
      createdAt: -1,
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE task for current user
router.post("/", async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      userId: req.userId,
    });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// UPDATE task (only if belongs to current user)
router.put("/:id", async (req, res) => {
  try {
    const task = await Task.findOne({ id: req.params.id, userId: req.userId });
    if (!task) return res.status(404).json({ error: "Task not found" });

    Object.assign(task, req.body);
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// TOGGLE subtask with THREADING support
router.patch("/:id/subtasks/:subtaskId", async (req, res) => {
  try {
    const { completed, logMessage } = req.body;
    const task = await Task.findOne({ id: req.params.id, userId: req.userId });

    if (!task) return res.status(404).json({ error: "Task not found" });

    const subtask = task.subtasks.find((s) => s.id === req.params.subtaskId);
    if (!subtask) return res.status(404).json({ error: "Subtask not found" });

    // Toggle completion
    subtask.completed = completed;

    // Recalculate progress
    const completedCount = task.subtasks.filter((s) => s.completed).length;
    task.progress = Math.round((completedCount / task.subtasks.length) * 100);

    // Update status
    if (task.progress === 100) task.status = "Completed";
    else if (task.progress > 0) task.status = "In Progress";
    else task.status = "Pending";

    // Create system log message for checkbox action
    const systemLogId = `sys-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const systemLogMessage = `${completed ? "Completed" : "Unchecked"}: ${subtask.text}`;

    let parentId = null;

    // If user added a manual note, create it as PARENT first
    if (logMessage && logMessage.trim()) {
      const noteId = `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      task.logs.unshift({
        id: noteId,
        timestamp: Date.now(),
        message: logMessage.trim(),
        progress: task.progress,
        parentId: null,
        isSystemLog: false,
      });

      parentId = noteId;

      // Save parent note to persistent ActivityLog
      const noteActivityLog = new ActivityLog({
        userId: req.userId,
        taskId: task.id,
        taskTitle: task.title,
        message: logMessage.trim(),
        progress: task.progress,
        timestamp: Date.now(),
        parentId: null,
        isSystemLog: false,
      });
      await noteActivityLog.save();
    }

    // Add system log
    task.logs.unshift({
      id: systemLogId,
      timestamp: Date.now(),
      message: systemLogMessage,
      progress: task.progress,
      parentId: parentId,
      isSystemLog: true,
    });

    // Save system log to persistent ActivityLog
    const systemActivityLog = new ActivityLog({
      userId: req.userId,
      taskId: task.id,
      taskTitle: task.title,
      message: systemLogMessage,
      progress: task.progress,
      timestamp: Date.now(),
      parentId: parentId,
      isSystemLog: true,
    });
    await systemActivityLog.save();

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE task (only if belongs to current user)
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      id: req.params.id,
      userId: req.userId,
    });
    if (!task) return res.status(404).json({ error: "Task not found" });

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CLEAR ALL tasks for current user
router.delete("/", async (req, res) => {
  try {
    await Task.deleteMany({ userId: req.userId });
    res.json({ message: "All tasks cleared" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
