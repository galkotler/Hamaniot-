const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ["רגשי", "חינוכי", "חברתי"],
    required: true
  },
  audience: {
    type: String,
    enum: ["גיל הרך", "ילדים", "נוער"],
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  file_type: {
    type: String,
    required: true
  },
  upload_date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Content", contentSchema);
