const express = require("express");
const router = express.Router();
const Report = require("../models/report");

// ✅ יצירת דוח רגיל (עדכון מצב / נוכחות פרטנית)
router.post("/", async (req, res) => {
  try {
    const user = req.session?.user;
    if (!user) {
      return res.status(401).json({ message: "לא מחובר" });
    }

    const { type, child, content, date } = req.body;

    const report = new Report({
      type,
      volunteer: user.id, // 📌 מזהה המתנדב מתוך session
      child,
      content,
      date: date ? new Date(date) : new Date()
    });

    await report.save();
    res.status(201).json({ message: "✅ הדוח נשמר בהצלחה", report });

  } catch (err) {
    console.error("❌ שגיאה ביצירת דוח:", err);
    res.status(500).json({ message: "שגיאה בשמירת הדוח", error: err.message });
  }
});

// ✅ יצירת דוח נוכחות קבוצתי
router.post("/group-attendance", async (req, res) => {
  try {
    const user = req.session?.user;
    if (!user) {
      return res.status(401).json({ message: "לא מחובר" });
    }

    const { present_children = [], absent_children = [], date, content = "" } = req.body;
    const reportDate = date ? new Date(date) : new Date();
    const allReports = [];

    for (const childId of present_children) {
      allReports.push(new Report({
        type: "נוכחות",
        volunteer: user.id,
        child: childId,
        content: `✅ נוכח בתאריך ${reportDate.toLocaleDateString("he-IL")}${content ? " – " + content : ""}`,
        date: reportDate
      }));
    }

    for (const childId of absent_children) {
      allReports.push(new Report({
        type: "נוכחות",
        volunteer: user.id,
        child: childId,
        content: `❌ נעדר בתאריך ${reportDate.toLocaleDateString("he-IL")}${content ? " – " + content : ""}`,
        date: reportDate
      }));
    }

    await Report.insertMany(allReports);
    res.status(201).json({ message: "✅ דוח נוכחות קבוצתי נשמר", count: allReports.length });

  } catch (err) {
    console.error("❌ שגיאה בדוח קבוצתי:", err);
    res.status(500).json({ message: "שגיאה בדוח קבוצתי", error: err.message });
  }
});

// ✅ שליפת כל הדוחות
router.get("/", async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("volunteer", "full_name")
      .populate("child", "first_name last_name")
      .sort({ date: -1 });

    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: "שגיאה בשליפת דוחות", error: err.message });
  }
});

// ✅ שליפת דוחות לפי מתנדב
router.get("/volunteer/:id", async (req, res) => {
  try {
    const reports = await Report.find({ volunteer: req.params.id })
      .populate("child", "first_name last_name")
      .sort({ date: -1 });

    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: "שגיאה בשליפת דוחות למתנדב", error: err.message });
  }
});

// ✅ שליפת דוחות לפי ילד
router.get("/child/:id", async (req, res) => {
  try {
    const reports = await Report.find({ child: req.params.id })
      .populate("volunteer", "full_name")
      .sort({ date: -1 });

    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: "שגיאה בשליפת דוחות לילד", error: err.message });
  }
});

module.exports = router;
