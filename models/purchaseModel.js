const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Course",
    },
    packageId: {
      type: String,
      required: true,
    },
    watchList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    currentvideo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
    expireAt: { type: Date, required: true },
    timeLimit: { type: Number, required: true },
  },
  { timestamps: true }
);

const Purchase =
  mongoose.models.Purchase || mongoose.model("Purchase", purchaseSchema);
module.exports = Purchase;
