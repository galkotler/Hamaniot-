const express = require("express");
const router = express.Router();
const Child = require("../models/child");
const Volunteer = require("../models/volunteer");
const Content = require("../models/content");

router.get("/", async (req, res) => {
  try {
    const [childrenCount, volunteersCount, uploadsCount] = await Promise.all([
      Child.countDocuments(),
      Volunteer.countDocuments(),
      Content.countDocuments({ upload_date: { $gte: startOfWeek() } }),
    ]);

    const messagesCount = 0; // בעתיד תוכל להחליף את זה במספר הודעות אמיתי

    res.json({
      children: childrenCount,
      volunteers: volunteersCount,
      uploads: uploadsCount,
      messages: messagesCount,
    });
  } catch (err) {
    console.error("Error in /api/stats:", err);
    res.status(500).json({ error: "Failed to load stats" });
  }
});

function startOfWeek() {
  const now = new Date();
  now.setDate(now.getDate() - now.getDay());
  now.setHours(0, 0, 0, 0);
  return now;
}

module.exports = router;
