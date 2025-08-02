const Course = require("../models/courseModel");
const Purchase = require("../models/purchaseModel.js");
const Video = require("../models/videoModel.js");
const Lession = require("../models/lessionModel.js");

const getAllCourses = async (req, res) => {
  const { userId } = req.body;
  console.log(userId);
  try {
    const courses = await Course.find().sort({ order: 1 }).lean();
    let purchases = [];
    if (userId) {
      purchases = await Purchase.find({
        userId,
        expireAt: { $gt: new Date() }, // Only get unexpired purchases
      }).lean();
    }
    res.status(200).json({ success: true, courses, purchases });
  } catch (error) {
    console.error("Error fetching courses:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getCourseById = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  console.log(userId);
  try {
    const course = await Course.findById(id).lean();
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    let purchase = null;
    if (userId) {
      purchase = await Purchase.findOne({
        userId,
        courseId: id,
        expireAt: { $gt: new Date() }, // Only get unexpired purchases
      }).lean();
    }

    res.status(200).json({ success: true, course, purchase });
  } catch (error) {
    console.error("Error fetching course:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getPurchaseDetails = async (req, res) => {
  const courseId = req.params;
  const userId = req.userId;
  if (!courseId || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Course ID and User ID are required" });
  }
  try {
    const purchase = await Purchase.findOne({ userId, courseId });
    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }
    res.status(200).json({ success: true, purchase });
  } catch (error) {
    console.error("Error fetching purchase details:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAllPurchases = async (req, res) => {
  const userId = req.userId;
  try {
    const purchases = await Purchase.find({ userId }).populate("courseId");
    res.status(200).json({ success: true, purchases });
  } catch (error) {
    console.error("Error fetching purchases:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getVideoWithLessions = async (req, res) => {
  const { videoId: id } = req.params;
  const userId = req.userId;

  if (!userId) {
    return res
      .status(401)
      .json({ success: false, error: "User not logged in!" });
  }

  try {
    const video = await Video.findById(id);
    if (!video) return res.status(404).json({ error: "Video not found!" });

    const lession = await Lession.findById(video.lessionId);
    if (!lession) return res.status(404).json({ error: "Lession not found!" });

    const courseId = lession.courseId;

    // Fetch all lessons for the course
    const lessions = await Lession.find({ courseId }).sort({ order: 1 });

    // Populate videos for each lesson
    const enrichedLessions = await Promise.all(
      lessions.map(async (lsn) => {
        const vids = await Video.find({ lessionId: lsn._id }).sort({
          order: 1,
        });
        return { ...lsn.toObject(), videos: vids };
      })
    );

    // Update purchase progress
    await Purchase.updateOne(
      { userId, courseId },
      {
        $set: { currentvideo: id },
        $addToSet: { watchList: id },
      },
      { upsert: true }
    );

    // Fetch updated purchase
    const purchase = await Purchase.findOne({ userId, courseId });

    return res.json({
      success: true,
      video,
      lessions: enrichedLessions,
      purchase,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to load course!" });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  getPurchaseDetails,
  getAllPurchases,
  getVideoWithLessions,
};
