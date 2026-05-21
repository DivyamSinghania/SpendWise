const express = require('express');
const authMiddleware = require('../middleware/auth');
const expenseController = require('../controllers/expenseController');

const router = express.Router();

// All expense routes require authentication
router.get('/', authMiddleware, expenseController.getExpenses);
router.post('/', authMiddleware, expenseController.createExpense);
router.delete('/:id', authMiddleware, expenseController.deleteExpense);

module.exports = router;
