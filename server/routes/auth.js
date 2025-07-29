const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { loginRateLimiter } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const {
  registerUser,
  loginUser,
  verifyEmail,
  verifyLoginOTP,
} = require("../controllers/authController");

router.post(
  "/register",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 8 })
      .matches(/[A-Z]/)
      .withMessage("Password must include an uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must include a lowercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must include a number")
      .matches(/[!@#$%^&*]/)
      .withMessage("Password must include a special character"),
  ],
  validate,
  registerUser
);

router.post("/verify-email", verifyEmail);
router.post("/login", loginRateLimiter, loginUser);
router.post("/verify-login-otp", verifyLoginOTP);

module.exports = router;
