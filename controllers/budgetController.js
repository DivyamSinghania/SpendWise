const Budget = require('../models/Budget');

// Get budget for user
const getBudget = async (req, res) => {
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
};

// Update budget for user
const updateBudget = async (req, res) => {
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
};

module.exports = {
    getBudget,
    updateBudget
};
