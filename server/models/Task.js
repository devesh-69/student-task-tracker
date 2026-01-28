const mongoose = require("mongoose");

const SubtaskSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const TaskHistoryLogSchema = new mongoose.Schema({
  id: { type: String, required: true },
  timestamp: { type: Number, required: true },
  message: { type: String, required: true },
  progress: { type: Number, required: true },
  parentId: { type: String, default: null },
  isSystemLog: { type: Boolean, default: false },
});

const TaskSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    subtasks: [SubtaskSchema],
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    createdAt: { type: Number, default: Date.now },
    logs: [TaskHistoryLogSchema],
  },
  {
    timestamps: true,
  },
);

// Compound index for efficient user-specific queries
TaskSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Task", TaskSchema);
