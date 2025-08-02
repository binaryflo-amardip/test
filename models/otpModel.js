const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    otp: {
      type: Number,
      required: true,
      min: 100000,
      max: 999999,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 60 * 60 * 3,
    },
  },
  { timestamps: false }
);

const Otp = mongoose.models.Otp || mongoose.model("Otp", otpSchema);
module.exports = Otp;
