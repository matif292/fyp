const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getRecommendations, saveBudgetPreference } = require('../controllers/budgetController');

router.get('/recommendations', getRecommendations);
router.post('/save', auth, saveBudgetPreference);

module.exports = router;