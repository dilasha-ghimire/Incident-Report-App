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

    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    if (complaint.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to edit this complaint" });
    }

    if (complaint.status !== "Pending") {
      return res
        .status(403)
        .json({ error: "Only Pending complaints can be edited" });
    }

    const { title, type, description, removeImage } = req.body;

    if (title) complaint.title = title;
    if (type) complaint.type = type;
    if (description) complaint.description = description;

    if (req.file) {
      complaint.image = req.file.filename;
    } else if (removeImage === "true") {
      complaint.image = "";
    }

    await complaint.save();
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: "Failed to update complaint" });
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
