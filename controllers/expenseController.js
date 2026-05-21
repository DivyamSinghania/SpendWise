const Expense = require('../models/Expense');

// Get all expenses with filtering
const getExpenses = async (req, res) => {
    try {
        const query = { userId: req.userId };
        if (req.query.category && req.query.category !== 'All') {
            query.category = req.query.category;
        }
        if (req.query.month) {
            query.date = { $regex: `^${req.query.month}` };
        }
        const expenses = await Expense.find(query)
            .sort({ createdAt: -1 });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
};

// Create new expense
const createExpense = async (req, res) => {
    try {
        const { title, amount, category, date, note } = req.body;
        if (!title || !amount || !category || !date) {
            return res.status(400).json({ 
                error: 'Missing required fields' 
            });
        }
        const expense = new Expense({
            userId: req.userId,
            title,
            amount: parseFloat(amount),
            category,
            date,
            note: note || ''
        });
        await expense.save();
        res.status(201).json(expense);
    } catch (err) {
        res.status(500).json({ error: 'Failed to add expense' });
    }
};

// Delete expense
const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId
        });
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete' });
    }
};

module.exports = {
    getExpenses,
    createExpense,
    deleteExpense
};
