const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ הפעלת trust proxy כדי לטפל נכון בחיבורי HTTPS מאחורי פרוקסי (כמו Render)
app.set('trust proxy', 1);

// ✅ CORS – מאפשר העברת cookies בין פורטים
app.use(cors({
    origin: 'https://hamaniot-3.onrender.com', // הכתובת של ה-Frontend שלך
    credentials: true
}));

// ✅ שימוש בפרסרים לפני כל route
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ חיבור למסד הנתונים עם טיפול שגיאות מורחב
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Attempted MongoDB connection.');
        // This 'then' block only indicates the initial connection attempt started.
        // The actual success/failure will be logged by the connection events.
    })
    .catch(err => {
        // This catch block might not always be hit for immediate crashes,
        // but is good practice.
        console.error('❌ MongoDB initial connection promise rejection:', err.message);
    });

// Event listeners for Mongoose connection
mongoose.connection.on('error', err => {
    console.error('❌ MongoDB connection error event:', err.message);
    // You might want to exit the process here in a real application if the DB is critical
    // process.exit(1); 
});

mongoose.connection.once('open', () => {
    console.log('✅ MongoDB connection successfully established!');
});

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB connection disconnected.');
});


// ✅ הגדרת מאגר סשנים מבוסס MongoDB
// ודא ש-MONGO_URI מוגדר במשתני הסביבה שלך ב-Render
const sessionStore = MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions', // שם הקולקציה שבה ישמרו הסשנים ב-MongoDB
    ttl: 60 * 60, // זמן חיים של סשן בשניות (שעה אחת, זהה ל-maxAge של ה-cookie)
    autoRemove: 'interval', // הסרת סשנים פגי תוקף אוטומטית
    autoRemoveInterval: 10 // בדוק כל 10 דקות והסר
});

// ✅ ניהול session עם MongoStore
app.use(session({
    secret: process.env.SESSION_SECRET || 'supersecretkey_fallback_please_change_in_production', // השתמש במפתח סודי חזק וייחודי
    store: sessionStore, // 👈 הגדרת ה-MongoStore
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true, // חייב להיות true ב-production (HTTPS) ועם sameSite: 'none'
        httpOnly: true,
        sameSite: 'none', // חיוני לתקשורת Cross-Origin עם cookies
        maxAge: 1000 * 60 * 60 // שעה אחת
    }
}));

// ✅ הדפסת פרטי סשן ועוגיות לניפוי באגים (הפעם מופעלים)
app.use((req, res, next) => {
    console.log('Request received. Path:', req.path);
    console.log('Session ID:', req.sessionID);
    console.log('Current Session User:', req.session.user);
    console.log('Request Cookies:', req.headers.cookie);
    next();
});

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
    console.log(`🚀 Server is listening on port ${PORT}. Access it via Render URL in production.`);
});
