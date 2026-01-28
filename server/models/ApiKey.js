const mongoose = require("mongoose");

const ApiKeySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    key: { type: String, required: true },
    service: { type: String, default: "gemini" },
  },
  {
    timestamps: true,
  },
);

// Compound index for efficient user-specific queries
ApiKeySchema.index({ userId: 1, service: 1 });

module.exports = mongoose.model("ApiKey", ApiKeySchema);
