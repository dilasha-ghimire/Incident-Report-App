const Complaint = require("../models/Complaint");
const User = require("../models/User");
const logger = require("../middleware/logger");

exports.getAllReports = async (req, res) => {
  try {
    const reports = await Complaint.find().populate("user", "username email");
    res.json(reports);
  } catch {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
};

exports.updateReportStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const report = await Complaint.findById(id);
    if (!report) return res.status(404).json({ error: "Report not found" });

    report.status = status;
    await report.save();
    logger.info(
      `ADMIN ${req.user.username} set status of report ${id} to ${status}`
    );
    res.json({ message: "Status updated" });
  } catch {
    res.status(500).json({ error: "Failed to update report" });
  }
};

exports.getAllUsers = async (req, res) => {
  const users = await User.find().select("-password -previousPasswords");
  res.json(users);
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, role } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.username = username;
    user.email = email;
    user.role = role;
    await user.save();
    logger.info(`ADMIN ${req.user.username} updated user ${user.email}`);
    res.json({ message: "User updated" });
  } catch {
    res.status(500).json({ error: "Update failed" });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndDelete(id);
  logger.info(`ADMIN ${req.user.username} deleted user ${deletedUser?.email}`);
  res.json({ message: "User deleted" });
};
