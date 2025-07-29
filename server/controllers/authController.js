const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { sendEmailOTP } = require("../middleware/mailer");

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

  res.json({
    token,
    user: { id: user._id, username: user.username, role: user.role },
  });
};
