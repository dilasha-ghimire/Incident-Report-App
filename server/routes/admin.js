const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin.js");
const {
  getAllReports,
  updateReportStatus,
  getAllUsers,
  updateUser,
  deleteUser,
} = require("../controllers/adminController");

router.get("/reports", protect, isAdmin, getAllReports);
router.patch("/reports/:id", protect, isAdmin, updateReportStatus);
router.get("/users", protect, isAdmin, getAllUsers);
router.put("/users/:id", protect, isAdmin, updateUser);
router.delete("/users/:id", protect, isAdmin, deleteUser);

module.exports = router;
