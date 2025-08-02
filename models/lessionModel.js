const mongoose = require("mongoose");

const lessionSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Course",
  },
  name: {
    type: String,
    required: true,
  },
  length: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
});

const Lession =
  mongoose.models.Lession || mongoose.model("Lession", lessionSchema);
module.exports = Lession;
