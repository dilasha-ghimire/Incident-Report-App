const express = require("express");
const router = express.Router();
const {
  createComplaint,
  getUserComplaints,
} = require("../controllers/complaintController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createComplaint);
router.get("/", protect, getUserComplaints);

module.exports = router;
