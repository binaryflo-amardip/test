const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  lessionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Lession",
  },
  name: {
    type: String,
    required: true,
  },
  length: {
    type: String,
    required: true,
    default: "00:00:00",
  },
  description: {
    type: String,
    required: true,
    default: "",
  },
  link: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
});

const Video = mongoose.models.Video || mongoose.model("Video", videoSchema);
module.exports = Video;
