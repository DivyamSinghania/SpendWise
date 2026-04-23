require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5001;

// ── Create uploads folder if not exists ──
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// ── Middleware ──
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// ── Session (needed for Passport OAuth) ──
app.use(session({
    secret: process.env.JWT_SECRET || 'spendwise-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(passport.initialize());
app.use(passport.session());

// ── MongoDB Connection ──
mongoose.connect(process.env.MONGODB_URI || 
    'mongodb://127.0.0.1:27017/spendwise')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB Error:', err));

// ══════════════════════════════════════
// MODELS
// ══════════════════════════════════════

// User Model
const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, default: null },
    profilePic: { type: String, default: '' },
    googleId: { type: String, default: null },
    authMethod: { 
        type: String, 
        enum: ['local', 'google'], 
        default: 'local' 
    },
    createdAt: { type: Date, default: Date.now }
}, { collection: 'Users' });

const User = mongoose.model('Users', userSchema);

// Expense Model
const expenseSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Users', 
        required: true 
    },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: String, required: true },
    note: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
}, { collection: 'Expenses' });

const Expense = mongoose.model('Expenses', expenseSchema);

// Budget Model
const budgetSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Users', 
        required: true, 
        unique: true 
    },
    monthly: { type: Number, default: 0 }
}, { collection: 'Budgets' });

const Budget = mongoose.model('Budgets', budgetSchema);

// ══════════════════════════════════════
// HELPERS
// ══════════════════════════════════════

const hashPassword = (p) => 
    crypto.createHash('sha256').update(p).digest('hex');

const generateToken = (user) => 
    jwt.sign(
        { id: user._id, email: user.email, name: user.name },
        process.env.JWT_SECRET || 'spendwise-secret',
        { expiresIn: '7d' }
    );

const sanitizeUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    profilePic: user.profilePic,
    authMethod: user.authMethod,
    createdAt: user.createdAt
});

// JWT Middleware
const authMiddleware = (req, res, next) => {
    const token = req.cookies?.token || 
                  req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET || 'spendwise-secret'
        );
        req.userId = decoded.id;
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => 
        cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// ══════════════════════════════════════
// PASSPORT GOOGLE OAUTH
// ══════════════════════════════════════

const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL || 
        'http://localhost:5001/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
            // Check if email already registered locally
            user = await User.findOne({ 
                email: profile.emails[0].value 
            });

            if (user) {
                // Link Google to existing account
                user.googleId = profile.id;
                user.authMethod = 'google';
                await user.save();
            } else {
                // Create brand new user from Google
                user = new User({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    googleId: profile.id,
                    profilePic: profile.photos[0]?.value || '',
                    authMethod: 'google'
                });
                await user.save();
            }
        }
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// ══════════════════════════════════════
// AUTH ROUTES
// ══════════════════════════════════════

// Get current user
app.get('/api/auth/me', async (req, res) => {
    try {
        const token = req.cookies?.token || 
                      req.headers.authorization?.split(' ')[1];
        if (!token) return res.json({ user: null });

        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET || 'spendwise-secret'
        );
        const user = await User.findById(decoded.id);
        if (!user) return res.json({ user: null });
        res.json({ user: sanitizeUser(user) });
    } catch {
        res.json({ user: null });
    }
});

// Signup with profile pic
app.post('/api/auth/signup', 
    upload.single('profilePic'), 
    async (req, res) => {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                if (req.file) fs.unlinkSync(req.file.path);
                return res.status(400).json({ 
                    error: 'Name, email and password are required' 
                });
            }

            const normalizedEmail = email.trim().toLowerCase();
            const existingUser = await User.findOne({ 
                email: normalizedEmail 
            });

            if (existingUser) {
                if (req.file) fs.unlinkSync(req.file.path);
                return res.status(409).json({ 
                    error: 'User already exists with this email' 
                });
            }

            const newUser = new User({
                name: name.trim(),
                email: normalizedEmail,
                password: hashPassword(password),
                profilePic: req.file ? req.file.path : '',
                authMethod: 'local'
            });

            await newUser.save();
            const token = generateToken(newUser);

            res.cookie('token', token, {
                httpOnly: true,
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.status(201).json({ 
                user: sanitizeUser(newUser), 
                token 
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Signup failed' });
        }
    }
);

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Email and password are required' 
            });
        }

        const user = await User.findOne({ 
            email: email.trim().toLowerCase() 
        });

        if (!user || user.password !== hashPassword(password)) {
            return res.status(401).json({ 
                error: 'Invalid email or password' 
            });
        }

        const token = generateToken(user);
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ user: sanitizeUser(user), token });
    } catch (err) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
});

// Google OAuth routes
app.get('/auth/google',
    passport.authenticate('google', { 
        scope: ['profile', 'email'] 
    })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { 
        failureRedirect: 'http://localhost:3000/account' 
    }),
    async (req, res) => {
        // Generate JWT for Google user
        const token = generateToken(req.user);
        // Redirect to frontend with token in URL
        res.redirect(
            `http://localhost:3000/?token=${token}`
        );
    }
);

// ══════════════════════════════════════
// EXPENSE ROUTES (Protected)
// ══════════════════════════════════════

app.get('/api/expenses', authMiddleware, async (req, res) => {
    try {
        const query = { userId: req.userId };
        if (req.query.category && req.query.category !== 'All') {
            query.category = req.query.category;
        }
        if (req.query.month) {
            query.date = { $regex: `^${req.query.month}` };
        }
        const expenses = await Expense.find(query)
            .sort({ createdAt: -1 });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});

app.post('/api/expenses', authMiddleware, async (req, res) => {
    try {
        const { title, amount, category, date, note } = req.body;
        if (!title || !amount || !category || !date) {
            return res.status(400).json({ 
                error: 'Missing required fields' 
            });
        }
        const expense = new Expense({
            userId: req.userId,
            title,
            amount: parseFloat(amount),
            category,
            date,
            note: note || ''
        });
        await expense.save();
        res.status(201).json(expense);
    } catch (err) {
        res.status(500).json({ error: 'Failed to add expense' });
    }
});

app.delete('/api/expenses/:id', authMiddleware, async (req, res) => {
    try {
        const expense = await Expense.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId
        });
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete' });
    }
});

// ══════════════════════════════════════
// BUDGET ROUTES (Protected)
// ══════════════════════════════════════

app.get('/api/budget', authMiddleware, async (req, res) => {
    try {
        let budget = await Budget.findOne({ userId: req.userId });
        if (!budget) {
            budget = new Budget({ userId: req.userId, monthly: 0 });
            await budget.save();
        }
        res.json(budget);
    } catch {
        res.status(500).json({ error: 'Failed to get budget' });
    }
});

app.put('/api/budget', authMiddleware, async (req, res) => {
    try {
        const budget = await Budget.findOneAndUpdate(
            { userId: req.userId },
            { monthly: parseFloat(req.body.monthly) || 0 },
            { upsert: true, new: true }
        );
        res.json(budget);
    } catch {
        res.status(500).json({ error: 'Failed to update budget' });
    }
});

// ══════════════════════════════════════
// SUMMARY ROUTE (Protected)
// ══════════════════════════════════════

app.get('/api/summary', authMiddleware, async (req, res) => {
    try {
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${
            String(now.getMonth() + 1).padStart(2, '0')
        }`;

        const allExpenses = await Expense.find({ userId: req.userId });
        const budget = await Budget.findOne({ userId: req.userId });

        const monthlyExpenses = allExpenses.filter(e => 
            e.date.startsWith(currentMonth)
        );

        const totalThisMonth = monthlyExpenses.reduce(
            (sum, e) => sum + e.amount, 0
        );
        const totalAll = allExpenses.reduce(
            (sum, e) => sum + e.amount, 0
        );

        const byCategory = monthlyExpenses.reduce((acc, e) => {
            acc[e.category] = (acc[e.category] || 0) + e.amount;
            return acc;
        }, {});

        const trend = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(
                now.getFullYear(), now.getMonth() - i, 1
            );
            const monthKey = `${d.getFullYear()}-${
                String(d.getMonth() + 1).padStart(2, '0')
            }`;
            const monthName = d.toLocaleString('default', { 
                month: 'short' 
            });
            const total = allExpenses
                .filter(e => e.date.startsWith(monthKey))
                .reduce((sum, e) => sum + e.amount, 0);
            trend.push({ month: monthName, amount: total });
        }

        res.json({
            totalThisMonth,
            totalAll,
            count: allExpenses.length,
            budget: budget?.monthly || 0,
            byCategory,
            trend
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to get summary' });
    }
});

// ── Start Server ──
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});