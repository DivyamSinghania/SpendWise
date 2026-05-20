const mongoose = require('mongoose');

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

module.exports = mongoose.model('Expenses', expenseSchema);
