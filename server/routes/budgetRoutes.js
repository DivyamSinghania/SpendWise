const express = require('express');
const authMiddleware = require('../middleware/auth');
const budgetController = require('../controllers/budgetController');

const router = express.Router();

// All budget routes require authentication
router.get('/', authMiddleware, budgetController.getBudget);
router.put('/', authMiddleware, budgetController.updateBudget);

module.exports = router;
