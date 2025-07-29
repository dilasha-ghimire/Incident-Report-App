const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "user" },
  emailVerified: { type: Boolean, default: false },
  emailOTP: String,
  emailOTPExpires: Date,
  loginOTP: String,
  loginOTPExpires: Date,
});

module.exports = mongoose.model("User", userSchema);
