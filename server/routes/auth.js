const express = require("express");
const router = express.Router();
const { loginRateLimiter } = require("../middleware/authMiddleware");
const {
  registerUser,
  loginUser,
  verifyEmail,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/verify-email", verifyEmail);
router.post("/login", loginRateLimiter, loginUser);

module.exports = router;
