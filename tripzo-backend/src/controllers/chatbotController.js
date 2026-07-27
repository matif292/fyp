const ChatbotAI = require('../services/chatbotAI');

// @desc    Send a message to the AI chatbot
// @route   POST /api/chatbot/message
// @access  Private
exports.sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }
        const result = await ChatbotAI.processMessage(req.userId, message.trim());
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('❌ Chatbot send message error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get chat history
// @route   GET /api/chatbot/history
// @access  Private
exports.getHistory = async (req, res) => {
    try {
        const history = await ChatbotAI.getHistory(req.userId, 50);
        res.json({ success: true, data: history });
    } catch (error) {
        console.error('❌ Chatbot get history error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Clear chat history and session
// @route   DELETE /api/chatbot/history
// @access  Private
exports.clearChat = async (req, res) => {
    try {
        await ChatbotAI.clearSession(req.userId);
        res.json({ success: true, message: 'Conversation cleared' });
    } catch (error) {
        console.error('❌ Chatbot clear error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
