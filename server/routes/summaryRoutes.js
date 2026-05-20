const express = require('express');
const authMiddleware = require('../middleware/auth');
const summaryController = require('../controllers/summaryController');

const router = express.Router();

// Summary route requires authentication
router.get('/', authMiddleware, summaryController.getSummary);

module.exports = router;
