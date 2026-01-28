const mongoose = require("mongoose");

// Persistent activity log - stays even after task deletion
const ActivityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    taskId: { type: String, required: true },
    taskTitle: { type: String, required: true },
    message: { type: String, required: true },
    progress: { type: Number, required: true },
    timestamp: { type: Number, default: Date.now },
    parentId: { type: String, default: null },
    isSystemLog: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for efficient queries
ActivityLogSchema.index({ userId: 1, taskId: 1 });
ActivityLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);
