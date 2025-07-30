const fs = require("fs");
const path = require("path");
const Complaint = require("../models/Complaint");

exports.createComplaint = async (req, res) => {
  try {
    const { title, type, description } = req.body;
    const image = req.file ? req.file.filename : null;

    const complaint = await Complaint.create({
      user: req.user.id,
      title,
      type,
      description,
      image,
    });

    res.status(201).json(complaint);
  } catch (err) {
    res.status(400).json({ error: "Failed to create complaint" });
  }
};

exports.updateComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint)
      return res.status(404).json({ message: "Complaint not found" });
    if (complaint.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });
    if (complaint.status !== "Pending")
      return res
        .status(400)
        .json({ message: "Only pending complaints can be edited" });

    // Update fields
    complaint.title = req.body.title || complaint.title;
    complaint.type = req.body.type || complaint.type;
    complaint.description = req.body.description || complaint.description;

    // If a new image is uploaded, replace the old one
    if (req.file) {
      if (complaint.image) {
        const oldPath = path.join(__dirname, "..", "uploads", complaint.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      complaint.image = req.file.filename;
    }

    // If removeImage is explicitly sent AND no new file is uploaded
    if (req.body.removeImage === "true" && !req.file && complaint.image) {
      const oldPath = path.join(__dirname, "..", "uploads", complaint.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      complaint.image = "";
    }

    await complaint.save();
    res.status(200).json(complaint);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server error" });
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
