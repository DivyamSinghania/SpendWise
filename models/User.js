const mongoose = require('mongoose');

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

module.exports = mongoose.model('Users', userSchema);
