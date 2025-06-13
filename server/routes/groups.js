const express = require("express");
const router = express.Router();

const Group = require("../models/group");
const Volunteer = require("../models/volunteer");
const Child = require("../models/child");

// ✅ שליפת כל הקבוצות
router.get("/", async (req, res) => {
  try {
    const groups = await Group.find()
      .populate("volunteers", "full_name")
      .populate("children", "first_name last_name");
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: "❌ שגיאה בשליפת קבוצות", error: err.message });
  }
});

// ✅ שיבוץ מתנדב לקבוצה לפי ID של הקבוצה
router.put("/:id/assign-volunteer", async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "לא נמצאה קבוצה" });

    const { volunteer_id } = req.body;
    if (!volunteer_id) return res.status(400).json({ message: "יש לשלוח מזהה מתנדב" });

    if (!group.volunteers.includes(volunteer_id)) {
      group.volunteers.push(volunteer_id);
      await group.save();
    }

    await Volunteer.findByIdAndUpdate(volunteer_id, { group: group._id });

    res.json({ message: "✅ המתנדב שובץ בהצלחה לקבוצה", group });
  } catch (err) {
    res.status(500).json({ message: "❌ שגיאה בשיבוץ מתנדב", error: err.message });
  }
});

// ✅ הסרת מתנדב מהקבוצה
router.put("/:id/remove-volunteer", async (req, res) => {
  try {
    const { volunteer_id } = req.body;
    if (!volunteer_id) return res.status(400).json({ message: "יש לשלוח מזהה מתנדב" });

    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "קבוצה לא נמצאה" });

    group.volunteers = group.volunteers.filter(id => id.toString() !== volunteer_id);
    await group.save();

    await Volunteer.findByIdAndUpdate(volunteer_id, { group: null });

    res.json({ message: "🔁 המתנדב הוסר מהקבוצה", group });
  } catch (err) {
    res.status(500).json({ message: "❌ שגיאה בהסרת מתנדב", error: err.message });
  }
});

// ✅ שיבוץ ילד לקבוצה
router.put("/:id/assign-child", async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "קבוצה לא נמצאה" });

    const { child_id } = req.body;
    if (!child_id) return res.status(400).json({ message: "חסר מזהה ילד" });

    if (!group.children.includes(child_id)) {
      group.children.push(child_id);
      await group.save();
    }

    await Child.findByIdAndUpdate(child_id, { group: group._id });

    res.json({ message: "✅ הילד שובץ בהצלחה לקבוצה", group });
  } catch (err) {
    res.status(500).json({ message: "❌ שגיאה בשיבוץ ילד", error: err.message });
  }
});

module.exports = router;
