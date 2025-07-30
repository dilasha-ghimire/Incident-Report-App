const express = require("express");
const router = express.Router();
const {
  createComplaint,
  getUserComplaints,
  updateComplaint,
} = require("../controllers/complaintController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

router.post("/", protect, upload.single("image"), createComplaint);
router.get("/", protect, getUserComplaints);
router.patch("/:id", protect, upload.single("image"), updateComplaint);

module.exports = router;
