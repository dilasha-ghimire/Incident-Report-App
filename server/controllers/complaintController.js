const fs = require("fs");
const path = require("path");
const sanitizeHtml = require("sanitize-html");
const Complaint = require("../models/Complaint");
const logger = require("../middleware/logger");

exports.createComplaint = async (req, res) => {
  try {
    let title = String(req.body.title || "").trim();
    let type = String(req.body.type || "").trim();
    let description = String(req.body.description || "").trim();

    title = sanitizeHtml(title, { allowedTags: [], allowedAttributes: {} });
    type = sanitizeHtml(type, { allowedTags: [], allowedAttributes: {} });
    description = sanitizeHtml(description, {
      allowedTags: [],
      allowedAttributes: {},
    });

    const image = req.file ? req.file.filename : null;

    const complaint = await Complaint.create({
      user: req.user.id,
      title,
      type,
      description,
      image,
    });
    logger.info(`COMPLAINT SUBMIT: ${req.user.username} - ${title}`);
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

    if (req.body.title) {
      complaint.title = sanitizeHtml(String(req.body.title).trim(), {
        allowedTags: [],
        allowedAttributes: {},
      });
    }

    if (req.body.type) {
      complaint.type = sanitizeHtml(String(req.body.type).trim(), {
        allowedTags: [],
        allowedAttributes: {},
      });
    }

    if (req.body.description) {
      complaint.description = sanitizeHtml(
        String(req.body.description).trim(),
        { allowedTags: [], allowedAttributes: {} }
      );
    }

    if (req.file) {
      if (complaint.image) {
        const oldPath = path.join(__dirname, "..", "uploads", complaint.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      complaint.image = req.file.filename;
    }

    if (req.body.removeImage === "true" && !req.file && complaint.image) {
      const oldPath = path.join(__dirname, "..", "uploads", complaint.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      complaint.image = "";
    }

    await complaint.save();
    logger.info(`COMPLAINT UPDATE: ${req.user.username} - ${complaint._id}`);
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
