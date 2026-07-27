const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    getConversations,
    getMessages,
    sendMessage,
    startConversation,
    markAsRead
} = require('../controllers/chatController');

// All routes require authentication
router.use(auth);

// Get all conversations for current user
router.get('/conversations', getConversations);

// Start a new conversation
router.post('/conversations', startConversation);

// Get messages in a conversation
router.get('/conversations/:conversationId/messages', getMessages);

// Send a message
router.post('/conversations/:conversationId/messages', sendMessage);

// Mark conversation as read
router.put('/conversations/:conversationId/read', markAsRead);

module.exports = router;