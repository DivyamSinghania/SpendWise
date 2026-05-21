const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const hashPassword = (password) => 
    crypto.createHash('sha256').update(password).digest('hex');

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

module.exports = {
    hashPassword,
    generateToken,
    sanitizeUser
};
