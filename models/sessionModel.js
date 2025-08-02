const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    platform: {
      type: String,
      enum: ["web", "app"],
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      // Don't use `expires` here. We'll define TTL index manually below.
    },
  },
  { timestamps: true }
);

// ✅ Explicitly create TTL index (28 days = 2419200 seconds)
sessionSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 28 }
);

const Session =
  mongoose.models.Session || mongoose.model("Session", sessionSchema);
module.exports = Session;
