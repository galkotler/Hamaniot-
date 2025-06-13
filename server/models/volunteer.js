const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  age: Number,
  email: String,
  phone: String,
  area: String,
  interests: String,

  // קישור לקבוצת גיל מתוך קולקציית Group
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    default: null  // המתנדב לא חייב להיכנס לקבוצה בעת יצירה
  },

  // רשימת ילדים ששויכו למתנדב
  assigned_children: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Child" }
  ]
});

module.exports = mongoose.models.Volunteer || mongoose.model("Volunteer", volunteerSchema);
