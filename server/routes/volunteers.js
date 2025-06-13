const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Volunteer = require("../models/volunteer");
const Child = require("../models/child");
const Group = require("../models/group");
const sendSMS = require("../utils/sendSMS");

// ✅ יצירת מתנדב חדש לפי age_category
router.post("/", async (req, res) => {
  try {
    const { full_name, age, email, phone, area, interests, group } = req.body;

    if (!group) {
      return res.status(400).json({ message: "יש לבחור קבוצת גיל למתנדב" });
    }

    const groupDoc = await Group.findById(group);
    if (!groupDoc) {
      return res.status(400).json({ message: `קבוצת גיל עם מזהה '${group}' לא קיימת` });
    }

    const volunteer = new Volunteer({
      full_name,
      age,
      email,
      phone,
      area,
      interests,
      group: groupDoc._id
    });

    await volunteer.save();

    res.status(201).json({ message: "המתנדב נוצר בהצלחה", volunteer_id: volunteer._id });

  } catch (err) {
    console.error("❌ שגיאה ביצירת מתנדב:", err);
    res.status(500).json({ message: "שגיאת שרת", error: err.message });
  }
});

// ✅ שליפת כל המתנדבים כולל קבוצה וילדים
router.get("/", async (req, res) => {
  try {
    const volunteers = await Volunteer.find()
      .populate("group", "name age_category")
      .populate("assigned_children");
    res.json(volunteers);
  } catch (err) {
    res.status(500).json({ message: "שגיאת שרת", error: err.message });
  }
});

// ✅ שליפת מתנדב לפי ID
router.get("/:id", async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id)
      .populate("group", "name age_category")
      .populate("assigned_children");

    if (!volunteer) {
      return res.status(404).json({ message: "מתנדב לא נמצא" });
    }

    res.json(volunteer);
  } catch (err) {
    res.status(500).json({ message: "שגיאת שרת", error: err.message });
  }
});

// ✅ עדכון מתנדב
router.put("/:id", async (req, res) => {
  try {
    const updated = await Volunteer.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updated) {
      return res.status(404).json({ message: "המתנדב לא נמצא" });
    }

    res.json({ message: "המתנדב עודכן בהצלחה", volunteer: updated });
  } catch (err) {
    res.status(500).json({ message: "שגיאה בעדכון מתנדב", error: err.message });
  }
});

// ✅ מחיקת מתנדב
router.delete("/:id", async (req, res) => {
  try {
    await Volunteer.findByIdAndDelete(req.params.id);
    res.json({ message: "Volunteer deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting volunteer", error: err.message });
  }
});

// ✅ שיבוץ מתנדב לילד + שליחת SMS
router.post("/assign", async (req, res) => {
  const { volunteer_id, child_id } = req.body;

  if (!mongoose.Types.ObjectId.isValid(volunteer_id) || !mongoose.Types.ObjectId.isValid(child_id)) {
    return res.status(400).json({ message: "מזהה מתנדב או ילד שגוי" });
  }

  try {
    const volunteer = await Volunteer.findById(volunteer_id);
    const child = await Child.findById(child_id);

    if (!volunteer || !child) {
      return res.status(404).json({ message: "המתנדב או הילד לא נמצאו" });
    }

    if (volunteer.assigned_children.includes(child._id)) {
      return res.status(400).json({ message: "הילד כבר שובץ למתנדב זה" });
    }

    volunteer.assigned_children.push(child._id);
    await volunteer.save();

    child.assigned_volunteer = volunteer._id;
    await child.save();

    await sendSMS(volunteer.phone, `שלום ${volunteer.full_name}, שובצת לילד חדש בעמותת חמניות.`);

    res.json({ message: "✔️ שיבוץ בוצע בהצלחה", volunteer });

  } catch (err) {
    console.error("❌ שגיאה בשיבוץ:", err);
    res.status(500).json({ message: "שגיאה בשיבוץ", error: err.message });
  }
});

// ✅ לוח מחוונים למתנדב
router.get("/volunteer-dashboard", async (req, res) => {
  try {
    const volunteerId = req.session.user?.id;
    if (!volunteerId) return res.status(401).json({ message: "לא מחובר" });
    const children = await Child.find({ assigned_volunteer: volunteerId });

    res.json({
      assignedChildren: children.length,
      children,
    });
  } catch (err) {
    console.error("שגיאה:", err);
    res.status(500).json({ message: "שגיאה בטעינת נתונים" });
  }
});

module.exports = router;
