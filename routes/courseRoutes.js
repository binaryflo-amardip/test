const express = require("express");
const {
  getAllCourses,
  getCourseById,
  getPurchaseDetails,
  getAllPurchases,
  getVideoWithLessions,
} = require("../controllers/courseController");
const { userAuth } = require("../middlewares/auth");

const router = express.Router();

router.post("/courses", getAllCourses);
router.post("/courses/:id", getCourseById);
router.get("/purchases/:courseId", userAuth, getPurchaseDetails);
router.get("/purchases", userAuth, getAllPurchases);
router.get("/video/:videoId", userAuth, getVideoWithLessions);

module.exports = router;
