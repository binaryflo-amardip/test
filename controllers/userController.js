const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Session = require("../models/sessionModel");
const Otp = require("../models/otpModel.js");
const { mailer, mailerHtml } = require("../utils/mailer.js");
const { generateSecureOTP } = require("../utils/otp.js");
const { getMail } = require("../utils/mails.js");

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, repassword, phone } =
      req.body;
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !repassword ||
      !phone
    ) {
      return res.json({ success: false, message: "Vul alle velden in!" }); // Please fill in all fields!
    }
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res.json({
        success: false,
        message: "Gebruiker met dit e-mailadres bestaat al!",
      }); // User with this email already exists!
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username: email,
      email: email,
      firstName: firstName,
      lastName: lastName,
      phone: phone,
      password: hashedPassword,
      resetPasswordToken: "",
      resetPasswordExpires: 0,
      isVerified: true,
      // isVerified: false,
    });

    const user = await newUser.save();

    const { subject, body } = getMail("registration", {
      name: `${firstName} ${lastName}`,
    });

    await mailerHtml(email, subject, body);

    res.json({ success: true, userId: user._id.toString(), email: user.email });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const registerCheckout = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      repassword,
      phone,
      platform,
    } = req.body;
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !repassword ||
      !phone ||
      !platform
    ) {
      return res.json({ success: false, message: "Vul alle velden in!" });
    }
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res.json({
        success: false,
        message: "Gebruiker met dit e-mailadres bestaat al!",
      }); // User with this email already exists!
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username: email,
      email: email,
      firstName: firstName,
      lastName: lastName,
      phone: phone,
      password: hashedPassword,
      resetPasswordToken: "",
      resetPasswordExpires: 0,
      isVerified: true,
      // isVerified: false,
    });

    const user = await newUser.save();

    const { subject, body } = getMail("registration", {
      name: `${firstName} ${lastName}`,
    });

    await mailerHtml(email, subject, body);

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "28d",
    });

    // Remove old sessions on this platform
    await Session.deleteMany({ userId: user._id, platform });

    // Create new session
    await Session.create({ userId: user._id, token, platform });

    // Set secure cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 28 * 24 * 60 * 60 * 1000,
    });

    const userData = {
      id: user._id.toString(),
      firstName: user.firstname,
      lastName: user.lastname,
      email: user.email,
      phone: user.phone,
    };

    return res.status(200).json({
      success: true,
      message: "Registratie succesvol!",
      userId: user._id,
      userData,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const sendVerifyOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Gebruiker niet gevonden!", // User not found!
      });
    }
    await Otp.deleteMany({ userId: user._id });
    const new_otp = generateSecureOTP();
    const otp = new Otp({ userId: user._id, otp: new_otp });
    await otp.save();

    const { subject, body } = getMail("otpverify", {
      otp: `${new_otp}`,
    });

    await mailerHtml(email, subject, body);

    res.status(200).json({ success: true, message: "" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const verifyUser = async (req, res) => {
  try {
    const { otp, userId, platform } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Gebruiker niet gevonden!" }); // User not found!
    }

    const otp_doc = await Otp.findOne(userId, otp);

    if (!otp_doc) {
      return res
        .status(401)
        .json({ success: false, message: "OTP is verlopen!" }); // OTP has expired!
    }

    if (otp_doc.otp === otp) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

      await Otp.deleteMany({ userId });

      // Invalidate old session for this platform
      await Session.deleteMany({ userId: user._id, platform });

      // Create new session
      await Session.create({
        userId: user._id,
        platform,
        token,
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        maxAge: 28 * 24 * 60 * 60 * 1000,
      });
      return res.status(200).json({ success: true, message: "" });
    }
    return res
      .status(401)
      .json({ success: false, message: "OTP komt niet overeen!" }); // OTP Mismatch!
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, platform } = req.body;

    if (!email || !password || !platform) {
      return res
        .status(400)
        .json({ success: false, message: "Vul alle velden in!" }); //Please fill in all fields!
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Gebruiker niet gevonden!" }); //User not found!
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Onjuist wachtwoord!" }); // Incorrect password!
    }

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ success: false, message: "Account niet geverifieerd!" }); // Account not verified!
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "28d",
    });

    // Remove old sessions on this platform
    await Session.deleteMany({ userId: user._id, platform });

    // Create new session
    await Session.create({ userId: user._id, token, platform });

    // Set secure cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 28 * 24 * 60 * 60 * 1000,
    });

    const userData = {
      id: user._id.toString(),
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      phone: user.phone,
    };

    return res.status(200).json({
      success: true,
      message: "Inloggen succesvol!", // Login successful!
      userId: user._id,
      userData,
      token,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const sendLoginOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Gebruiker niet gevonden!" }); // User not found!
    }
    await Otp.deleteMany({ userId: user._id });
    const new_otp = generateSecureOTP();
    const otp = new Otp({ userId: user._id, otp: new_otp });
    await otp.save();

    const { subject, body } = getMail("otplogin", {
      otp: `${new_otp}`,
    });

    await mailerHtml(email, subject, body);

    res.status(200).json({ success: true, message: "" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const verifyLoginOtp = async (req, res) => {
  try {
    const { otp, email, platform } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Gebruiker niet gevonden!" }); // User not found!
    }

    const otp_doc = await Otp.findOne({ userId: user._id, otp });

    if (!otp_doc) {
      return res
        .status(401)
        .json({ success: false, message: "OTP is verlopen!" }); // OTP has expired!
    }

    if (otp_doc.otp === Number(otp)) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "28d",
      });

      await Otp.deleteMany({ userId: user._id });

      // Invalidate old session for this platform
      await Session.deleteMany({ userId: user._id, platform });

      // Create new session
      await Session.create({
        userId: user._id,
        platform,
        token,
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        maxAge: 28 * 24 * 60 * 60 * 1000,
      });

      const userData = {
        id: user._id.toString(),
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
      };

      return res
        .status(200)
        .json({ success: true, message: "", userId: user._id, userData });
    }
    return res
      .status(401)
      .json({ success: false, message: "OTP komt niet overeen!" }); // OTP Mismatch!
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Gebruiker niet gevonden!", // User not found!
      });
    }
    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password/${user.email}/${token}`;

    const { subject, body } = getMail("forgotpassword", {
      resetUrl: `${resetUrl}`,
    });

    await mailerHtml(email, subject, body);
    return res.status(200).json({ success: true, message: "" });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, token, password } = req.body;
    const user = await User.findOne({
      email: email,
      resetPasswordToken: token,
    });
    const now = Date.now();
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Gebruiker niet gevonden!" }); // User not found!
    } else if (Number(user.resetPasswordExpires) < now) {
      return res
        .status(401)
        .json({ success: false, message: "Token verlopen!" }); // Token expired!
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
    await user.save();

    const { subject, body } = getMail("resetpassword", {});

    await mailerHtml(email, subject, body);
    return res.status(200).json({ success: true, message: "" });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getUser = async (req, res) => {
  try {
    const token = req.cookies.token;
    const user_raw = req.user;
    const user = {
      id: user_raw._id.toString(),
      firstName: user_raw.firstName,
      lastName: user_raw.lastName,
      email: user_raw.email,
      phone: user_raw.phone,
    };
    return res
      .status(200)
      .json({ success: true, user: user, token: token, message: "" });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { id, firstName, lastName, phone, email } = req.body;
    if (!firstName || !lastName || !phone) {
      return res
        .status(400)
        .json({ success: false, message: "Alle velden zijn verplicht!" }); // All fields are required!
    }
    await User.updateOne(
      { email: req.user.email },
      { firstName, lastName, phone }
    );

    const { subject, body } = getMail("updateprofile", {});

    await mailerHtml(email, subject, body);
    return res.status(200).json({ success: true, message: "" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, rePassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Gebruiker niet gevonden!" }); // User not found!
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Verkeerd oud wachtwoord!" }); // Incorrect old password!
    }
    if (newPassword !== rePassword) {
      return res.status(400).json({
        success: false,
        message:
          "Het nieuwe wachtwoord en het opnieuw ingevoerde wachtwoord komen niet overeen!", // New password and re-entered password do not match
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "Wachtwoord bijgewerkt!" }); // Password updated!
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const deleteProfile = async (req, res) => {
  try {
    await Session.deleteMany({
      userId: req.user._id,
    });
    await User.findByIdAndDelete(req.user._id);
    return res.status(200).json({ success: true, message: "" });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const logout = async (req, res) => {
  try {
    const { userId, platform } = req;

    await Session.deleteOne({ userId, platform, token: req.cookies.token });

    // Clear the cookie
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (err) {
    console.error("Logout error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  register,
  registerCheckout,
  sendVerifyOtp,
  verifyUser,
  login,
  sendLoginOtp,
  verifyLoginOtp,
  logout,
  forgotPassword,
  resetPassword,
  getUser,
  updateProfile,
  updatePassword,
  deleteProfile,
};
