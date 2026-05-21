const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(
            process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/spendwise'
        );
        console.log('✅ Connected to MongoDB');
    } catch (err) {
        console.error('❌ MongoDB Error:', err);
        process.exit(1);
    }
};

module.exports = connectDB;
