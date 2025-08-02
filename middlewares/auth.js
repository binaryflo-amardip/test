const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
const Session = require("../models/sessionModel.js");

const userAuth = async (req, res, next) => {
  try {
    const token =
      req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");
    const platform = req.header("X-Platform");
    console.log(token, platform);

    if (!token || !platform) {
      return res
        .status(401)
        .json({ success: false, message: "Token and platform required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password").lean();
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found!" });
    }

    // Validate token against active session
    const session = await Session.findOne({
      userId: user._id,
      platform,
      token,
    });
    if (!session) {
      return res
        .status(401)
        .json({ success: false, message: "Session invalid or expired!" });
    }

    req.user = user;
    req.userId = user._id;
    req.platform = platform;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    // fallback
    console.error("Authentication error:", error);
    res.status(401).json({ success: false, message: "Please authenticate" });
  }
};

module.exports = { userAuth };
