const mongoose = require("mongoose");

const allowedCategories = ["גיל רך", "ילדים", "נוער"];

const groupSchema = new mongoose.Schema({
  age_category: {
    type: String,
    required: true,
    enum: allowedCategories
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Child"
  }],
  volunteers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Volunteer"
  }]
}, { timestamps: true });

// הגנה מפני יצירת המודל פעמיים
module.exports = mongoose.models.Group || mongoose.model("Group", groupSchema);
