const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: { type: String, required: true },
  type: { type: String },
  description: { type: String, required: true },
  image: { type: String },
  status: {
    type: String,
    default: "Pending",
    enum: ["Pending", "In Progress", "Resolved", "Rejected"],
  },
  comment: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Complaint", complaintSchema);
