const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { sendEmailOTP } = require("../middleware/mailer");
const logger = require("../middleware/logger");

exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const isWeak =
    password.length < 8 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  if (isWeak) {
    return res.status(400).json({
      error:
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol.",
    });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      emailOTP: otp,
      emailOTPExpires: Date.now() + 10 * 60 * 1000, // 10 min
    });

    await sendEmailOTP(email, otp);
    logger.info(`REGISTER: ${email}`);
    res.status(201).json({
      message: "User registered. Please verify your email with the OTP sent.",
    });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });

  if (!user.emailVerified) {
    return res.status(403).json({ error: "Email is not verified" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.loginOTP = otp;
  user.loginOTPExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  await sendEmailOTP(email, otp);
  logger.info(`LOGIN ATTEMPT: ${email}`);
  res.status(200).json({
    message: "OTP sent to email. Please verify to complete login.",
    userId: user._id,
  });
};

exports.verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });

  if (user.emailVerified)
    return res.status(400).json({ error: "Email already verified" });

  if (
    user.emailOTP !== otp ||
    !user.emailOTPExpires ||
    user.emailOTPExpires < Date.now()
  ) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  user.emailVerified = true;
  user.emailOTP = null;
  user.emailOTPExpires = null;
  await user.save();

  res.json({ message: "Email verified successfully" });
};

exports.verifyLoginOTP = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });

  if (
    user.loginOTP !== otp ||
    !user.loginOTPExpires ||
    user.loginOTPExpires < Date.now()
  ) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  user.loginOTP = null;
  user.loginOTPExpires = null;
  await user.save();

  const token = jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
  logger.info(`LOGIN SUCCESS: ${user.email}`);
  res.json({
    message: "Login successful",
    user: { id: user._id, username: user.username, role: user.role },
  });
};

exports.getMe = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await User.findById(req.user.id).select("username email role");
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
  });
};

exports.logoutUser = (req, res) => {
  logger.info(`LOGOUT: ${req.user?.username || "Unknown"}`);
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  });
  res.json({ message: "Logged out" });
};

exports.updateProfile = async (req, res) => {
  const { username, email } = req.body;

  if (!username || !email)
    return res.status(400).json({ error: "Username and email are required" });

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.username = username;
    user.email = email;
    await user.save();
    logger.info(`PROFILE UPDATE: ${req.user.username}`);
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword)
    return res.status(400).json({ error: "Both passwords are required" });

  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch)
    return res.status(401).json({ error: "Current password is incorrect" });

  const isWeak =
    newPassword.length < 8 ||
    !/[A-Z]/.test(newPassword) ||
    !/[a-z]/.test(newPassword) ||
    !/[0-9]/.test(newPassword) ||
    !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);

  if (isWeak) {
    return res.status(400).json({
      error:
        "New password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
    });
  }

  const allHashes = [user.password, ...(user.previousPasswords || [])];
  for (const hash of allHashes) {
    const reused = await bcrypt.compare(newPassword, hash);
    if (reused) {
      return res
        .status(400)
        .json({ error: "You cannot reuse any of your last 5 passwords." });
    }
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  user.previousPasswords = [
    user.password,
    ...(user.previousPasswords || []),
  ].slice(0, 5);
  user.password = hashedNewPassword;

  await user.save();
  logger.info(`PASSWORD CHANGE: ${req.user.username}`);
  res.json({ message: "Password changed successfully" });
};
