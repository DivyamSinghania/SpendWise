const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

// Get summary data
const getSummary = async (req, res) => {
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
};

module.exports = {
    getSummary
};
