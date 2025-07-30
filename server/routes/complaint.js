const express = require("express");
const router = express.Router();
const csrf = require("csurf");

const {
  createComplaint,
  getUserComplaints,
  updateComplaint,
} = require("../controllers/complaintController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const csrfProtection = csrf({ cookie: true });

const uploadWithCSRF = [
  upload.single("image"),
  (req, res, next) => {
    csrfProtection(req, res, next);
  },
];

router.post("/", protect, ...uploadWithCSRF, createComplaint);
router.patch("/:id", protect, ...uploadWithCSRF, updateComplaint);
router.get("/", protect, csrfProtection, getUserComplaints);

module.exports = router;
