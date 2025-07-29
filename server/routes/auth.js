const express = require("express");
const router = express.Router();
const { loginRateLimiter } = require("../middleware/authMiddleware");
const {
  registerUser,
  loginUser,
  verifyEmail,
  verifyLoginOTP,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/verify-email", verifyEmail);
router.post("/login", loginRateLimiter, loginUser);
router.post("/verify-login-otp", verifyLoginOTP);

module.exports = router;
