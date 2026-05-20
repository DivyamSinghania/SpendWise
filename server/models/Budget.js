const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Users', 
        required: true, 
        unique: true 
    },
    monthly: { type: Number, default: 0 }
}, { collection: 'Budgets' });

module.exports = mongoose.model('Budgets', budgetSchema);
