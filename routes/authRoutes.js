const express = require('express');
const passport = require('passport');
const upload = require('../utils/upload');
const authController = require('../controllers/authController');

const router = express.Router();

// Get current user
router.get('/me', authController.getCurrentUser);

// Signup with profile pic
router.post('/signup', upload.single('profilePic'), authController.signup);

// Login
router.post('/login', authController.login);

// Logout
router.post('/logout', authController.logout);

// Google OAuth routes
router.get('/google', 
    passport.authenticate('google', { 
        scope: ['profile', 'email'] 
    })
);

router.get('/google/callback',
    passport.authenticate('google', { 
        failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3000'}/account`
    }),
    authController.handleGoogleCallback
);

module.exports = router;
