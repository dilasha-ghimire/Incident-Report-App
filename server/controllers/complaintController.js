const Complaint = require("../models/Complaint");

exports.createComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.create({
      user: req.user.id,
      title: req.body.title,
      type: req.body.type,
      description: req.body.description,
    });
    res.status(201).json(complaint);
  } catch (err) {
    res.status(400).json({ error: "Failed to create complaint" });
  }
};

exports.getUserComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user.id });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
};
