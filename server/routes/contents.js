const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Content = require("../models/content");

// הגדרת אחסון
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../uploads");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "_" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// שליפת כל התכנים
router.get("/", async (req, res) => {
  try {
    const contents = await Content.find().sort({ upload_date: -1 });
    res.json(contents);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// העלאת תוכן חדש
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { title, description, category, audience } = req.body;

    const newContent = new Content({
      title,
      description,
      category,
      audience,
      filename: req.file.filename,
      file_type: path.extname(req.file.originalname).replace(".", "").toUpperCase()
    });

    await newContent.save();
    res.status(201).json({ message: "תוכן נשמר בהצלחה", content: newContent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "שגיאת שרת", error: err });
  }
});

// מחיקת תוכן לפי ID
router.delete("/:id", async (req, res) => {
  try {
    const content = await Content.findByIdAndDelete(req.params.id);
    if (!content) return res.status(404).json({ message: "תוכן לא נמצא" });

    // מחיקת קובץ פיזית מהשרת
    const filePath = path.join(__dirname, "../uploads", content.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: "התוכן נמחק בהצלחה" });
  } catch (err) {
    res.status(500).json({ message: "שגיאה במחיקה", error: err });
  }
});

// עריכת תוכן
router.put("/:id", async (req, res) => {
  try {
    const { title, description, category, audience } = req.body;
    const updated = await Content.findByIdAndUpdate(
      req.params.id,
      { title, description, category, audience },
      { new: true }
    );
    res.json({ message: "תוכן עודכן בהצלחה", content: updated });
  } catch (err) {
    res.status(500).json({ message: "שגיאה בעדכון", error: err });
  }
});

module.exports = router;
