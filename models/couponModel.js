const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  code: {
    type: String,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
    default: 0,
  },
  discountType: {
    type: String,
    enum: ["percent", "flat"],
    required: true,
    default: "flat",
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },
});

const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);
module.exports = Coupon;
