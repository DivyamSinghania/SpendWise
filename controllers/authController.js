const fs = require('fs');
const User = require('../models/User');
const { hashPassword, generateToken, sanitizeUser } = require('../utils/helpers');

// Get current user
const getCurrentUser = async (req, res) => {
    try {
        const token = req.cookies?.token || 
                      req.headers.authorization?.split(' ')[1];
        if (!token) return res.json({ user: null });

        const jwt = require('jsonwebtoken');
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
};

// Signup with profile pic
const signup = async (req, res) => {
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
};

// Login
const login = async (req, res) => {
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
};

// Logout
const logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
};

// Handle Google OAuth callback
const handleGoogleCallback = async (req, res) => {
    try {
        const token = generateToken(req.user);
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        res.redirect(`${clientUrl}/?token=${token}`);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Google auth failed' });
    }
};

module.exports = {
    getCurrentUser,
    signup,
    login,
    logout,
    handleGoogleCallback
};
