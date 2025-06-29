const express = require("express");
const router = express.Router();

const Child = require("../models/child");
const Group = require("../models/group");

// ✅ שליפת כל הילדים
router.get("/", async (req, res) => {
  try {
    const role = req.session?.user?.role;
    const userGroupCategory = req.session?.user?.group?.age_category;
    const volunteerId = req.session?.user?.id;

    let query = {};

    if (role === "volunteer") {
      if (!userGroupCategory) {
        return res.status(400).json({ message: "קבוצת המתנדב לא תקינה" });
      }

      // מציג ילדים עם אותה קטגוריית גיל או משובצים אישית למתנדב
      const matchingGroups = await Group.find({ age_category: userGroupCategory });

      query = {
        $or: [
          { group: { $in: matchingGroups.map(g => g._id) } },
          { assigned_volunteer: volunteerId }
        ]
      };
    }

    const children = await Child.find(query).populate("group");
    res.json(children);
  } catch (err) {
    console.error("❌ שגיאה בטעינת ילדים:", err);
    res.status(500).json({ message: "שגיאה בטעינת ילדים", error: err.message });
  }
});

// ✅ שליפת ילד בודד לפי ID (לתצוגת פרופיל)
router.get("/:id", async (req, res) => {
  try {
    const child = await Child.findById(req.params.id)
      .populate("group")
      .populate("assigned_volunteer", "email full_name");

    if (!child) {
      return res.status(404).json({ message: "הילד לא נמצא" });
    }

    const user = req.session?.user;

    if (user?.role === "volunteer") {
      const isSameEmail = child.assigned_volunteer?.email === user.email;

      const sameGroupCategory = child.group?.age_category === user.group?.age_category;

      if (!isSameEmail && !sameGroupCategory) {
        return res.status(403).json({ message: "❌ אין לך הרשאה לצפות בפרופיל זה" });
      }
    }

    res.json(child);
  } catch (err) {
    console.error("❌ שגיאה בשליפת ילד לפי ID:", err);
    res.status(500).json({ message: "שגיאת שרת", error: err.message });
  }
});


// ✅ עדכון פרופיל ילד - רק למנהל
router.put("/:id", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).json({ message: "גישה נדחתה – רק מנהל יכול לעדכן פרופיל ילד" });
    }

    const { group, ...childData } = req.body;

    if (typeof group === 'string') {
      if (group.match(/^[0-9a-fA-F]{24}$/)) {
        const groupDoc = await Group.findById(group);
        if (!groupDoc) return res.status(400).json({ message: "Group ID not found" });
        childData.group = group;
      } else {
        const groupDoc = await Group.findOne({ age_category: group });
        if (!groupDoc) return res.status(400).json({ message: `Group '${group}' not found` });
        childData.group = groupDoc._id;
      }
    }

    const updatedChild = await Child.findByIdAndUpdate(
      req.params.id,
      { $set: childData },
      { new: true }
    ).populate("group");

    if (!updatedChild) {
      return res.status(404).json({ message: "הילד לא נמצא" });
    }

    res.json({ message: "Child updated successfully", child: updatedChild });

  } catch (err) {
    console.error("❌ שגיאה בעדכון ילד:", err);
    res.status(500).json({ message: "שגיאה בעדכון פרטי הילד", error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const child = await Child.findByIdAndDelete(req.params.id);
    if (!child) {
      return res.status(404).json({ message: "הילד לא נמצא" });
    }
    res.status(200).json({ message: "הילד נמחק בהצלחה" });
  } catch (err) {
    console.error("❌ שגיאה במחיקת ילד:", err);
    res.status(500).json({ message: "שגיאה בשרת בעת מחיקת הילד" });
  }
});

// ✅ יצירת ילד חדש עם המרה תקינה של group לפי age_category
router.post("/", async (req, res) => {
  try {
    let { group, ...childData } = req.body;

    if (typeof group === 'string' && !group.match(/^[0-9a-fA-F]{24}$/)) {
      const groupDoc = await Group.findOne({ age_category: group });
      if (!groupDoc) {
        return res.status(400).json({ message: `קבוצת גיל בשם '${group}' לא נמצאה` });
      }
      group = groupDoc._id;
    }

    const newChild = new Child({ ...childData, group });
    await newChild.save();
    res.status(201).json({ message: "✔️ הילד נשמר בהצלחה", child: newChild });
  } catch (err) {
    console.error("❌ שגיאה ביצירת ילד:", err);
    res.status(500).json({ message: "שגיאת שרת", error: err.message });
  }
});

module.exports = router;
