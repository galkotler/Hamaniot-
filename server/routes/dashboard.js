const express = require("express");
const router = express.Router();
const Volunteer = require("../models/volunteer");

// שליחת דאשבורד למתנדב המחובר
router.get("/volunteer-dashboard", async (req, res) => {
  try {
    const userId = req.session?.userId; // או req.user._id אם אתה עובד עם token
    if (!userId) return res.status(401).json({ message: "לא מחובר" });

    const volunteer = await Volunteer.findById(userId).populate("assigned_children");
    if (!volunteer) return res.status(404).json({ message: "המתנדב לא נמצא" });

    const assignedChildren = volunteer.assigned_children?.length || 0;

    res.json({ assignedChildren, weeklyContent: 0 }); // אפשר לעדכן בהמשך
  } catch (err) {
    res.status(500).json({ message: "שגיאת שרת", error: err.message });
  }
});

module.exports = router;
