const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ CORS – מאפשר העברת cookies בין פורטים
app.use(cors({
  origin: 'https://hamaniot-3.onrender.com', // שים את הפורט של ה-Frontend שלך
  credentials: true
}));

// ✅ שימוש בפרסרים לפני כל route
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ ניהול session
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', 
    httpOnly: true,
    sameSite: 'lax', 
    maxAge: 1000 * 60 * 60 
  }
}));

// ✅ חיבור למסד הנתונים
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ הגשת קבצים סטטיים מה-client
const clientPath = path.resolve(__dirname, '../client');
app.use(express.static(clientPath));

// ✅ ראוט לדף הבית
app.get('/', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

// ✅ ראוטים ל-API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/children', require('./routes/children'));
app.use('/api/volunteers', require('./routes/volunteers'));
app.use('/api/contents', require('./routes/contents'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/reports', require('./routes/reports'));

// ✅ הגשת קבצים שהועלו
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ טיפול בשגיאות 404 ל-API
app.use('/api', (req, res) => {
  res.status(404).json({ message: "🔍 API route not found" });
});

// ✅ הפעלת השרת
app.listen(PORT, () => {
  console.log(console.log(`🚀 Server is listening. Access it via Render URL in production.`));
});
