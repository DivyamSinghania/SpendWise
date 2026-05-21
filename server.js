require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

// ══════════════════════════════════════
// IMPORTS - CONFIG 
// ══════════════════════════════════════
const connectDB = require('./config/database');
const passport = require('./utils/passport');

// ══════════════════════════════════════
// IMPORTS - ROUTES
// ══════════════════════════════════════
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const summaryRoutes = require('./routes/summaryRoutes');

// ══════════════════════════════════════
// APPLICATION SETUP
// ══════════════════════════════════════
const app = express();
const PORT = process.env.PORT || 5001;

// Create uploads folder if not exists
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// ══════════════════════════════════════
// MIDDLEWARE
// ══════════════════════════════════════
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Session (needed for Passport OAuth)
app.use(session({
    secret: process.env.JWT_SECRET || 'spendwise-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(passport.initialize());
app.use(passport.session());

// ══════════════════════════════════════
// DATABASE CONNECTION
// ══════════════════════════════════════
connectDB();

// ══════════════════════════════════════
// ROUTES
// ══════════════════════════════════════
// Auth routes
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

// Protected API routes
app.use('/api/expenses', expenseRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/summary', summaryRoutes);

// ══════════════════════════════════════
// START SERVER
// ══════════════════════════════════════
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
