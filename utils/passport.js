const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Only initialize Google OAuth if credentials are available
if (process.env.GOOGLE_CLIENT_ID && 
    process.env.GOOGLE_CLIENT_SECRET &&
    !process.env.GOOGLE_CLIENT_ID.includes('your-') &&
    !process.env.GOOGLE_CLIENT_SECRET.includes('your-')) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL || 
            `${process.env.BACKEND_URL || 'http://localhost:5001'}/auth/google/callback`
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
} else {
    console.warn('⚠️  Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env to enable Google login.');
}

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;
