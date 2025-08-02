const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    pricing: [
      {
        id: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        normalPrice: {
          type: String,
          required: true,
        },
        salePrice: {
          type: String,
          required: true,
        },
        duration: {
          type: String,
          required: true,
        },
        features: [
          {
            type: String,
            required: true,
          },
        ],
        discount: {
          type: String,
          required: true,
        },
      },
    ],
    published: {
      type: Boolean,
      required: true,
      default: false,
    },
    noOfPurchases: {
      type: Number,
      required: true,
      default: 0,
    },
    lessions: {
      type: Number,
      required: true,
    },
    totallength: {
      type: String,
      required: true,
      default: "00:00:00",
    },
    language: {
      type: String,
      required: true,
      default: "English",
    },
    rating: {
      type: Number,
      required: true,
      default: 5,
      min: 1,
      max: 5,
    },
    order: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);
module.exports = Course;
