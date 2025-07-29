const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");
const { loginRateLimiter } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginRateLimiter, loginUser);

module.exports = router;
