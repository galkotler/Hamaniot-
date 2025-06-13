const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["נוכחות", "עדכון מצב"],
    required: true
  },
  volunteer: { type: mongoose.Schema.Types.ObjectId, ref: "Volunteer", required: true },
  child: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Report", reportSchema);
