const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Volunteer = require('../models/volunteer');
const Group = require('../models/group');

// ✅ התחברות
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            // console.log(`Login failed for email: ${email} - Invalid credentials.`);
            return res.status(401).json({ message: 'אימייל או סיסמה שגויים' });
        }

        let sessionData = {
            id: user._id,
            role: user.role,
            name: user.name,
            email: user.email
        };

        // אם המשתמש הוא מתנדב – נטען גם את הקבוצה שלו
        if (user.role === 'volunteer') {
            const volunteer = await Volunteer.findOne({ email }).populate('group');
            if (volunteer?.group) {
                sessionData.group = {
                    _id: volunteer.group._id,
                    name: volunteer.group.name,
                    age_category: volunteer.group.age_category
                };
            }
        }

        req.session.user = sessionData;
        // console.log('Login successful. Session user set:', req.session.user);

        res.json({
            message: "התחברת בהצלחה",
            ...sessionData
        });

    } catch (err) {
        console.error("❌ שגיאה ב-login:", err);
        res.status(500).json({ message: "שגיאה בשרת", error: err.message });
    }
});

// ✅ בדיקת התחברות פעילה
router.get('/check', (req, res) => {
    if (!req.session.user) {
        // console.log('Session check: No user in session. Returning 401.');
        return res.status(401).json({ message: 'לא מחובר' });
    }

    // console.log('Session check: User found in session:', req.session.user);
    res.json(req.session.user); // { id, role, name, group? }
});

// ✅ התנתקות
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("❌ שגיאה בהתנתקות:", err);
            return res.status(500).json({ message: "שגיאה ביציאה" });
        }
        res.clearCookie('connect.sid');
        // console.log('Logout successful. Session destroyed and cookie cleared.');
        res.json({ message: "🚪 התנתקת בהצלחה" });
    });
});

module.exports = router;
