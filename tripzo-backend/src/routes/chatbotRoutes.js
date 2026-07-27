const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { sendMessage, getHistory, clearChat } = require('../controllers/chatbotController');

router.use(auth);

router.post('/message', sendMessage);
router.get('/history', getHistory);
router.delete('/history', clearChat);

module.exports = router;
