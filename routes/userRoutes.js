const express = require("express");
const {
  register,
  sendVerifyOtp,
  verifyUser,
  login,
  sendLoginOtp,
  verifyLoginOtp,
  forgotPassword,
  resetPassword,
  getUser,
  updateProfile,
  updatePassword,
  deleteProfile,
} = require("../controllers/userController");
const { userAuth } = require("../middlewares/auth");

const router = express.Router();

router.post("/register", register);
router.post("/send-verification-otp", sendVerifyOtp);
router.post("/verify-user", verifyUser);

router.post("/login", login);
router.post("/send-login-otp", sendLoginOtp);
router.post("/verify-login-otp", verifyLoginOtp);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/", userAuth, getUser);
router.post("/update", userAuth, updateProfile);
router.post("/update-password", userAuth, updatePassword);
router.get("/delete", deleteProfile);

module.exports = router;
