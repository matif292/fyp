const Chat = require('../models/Chat');

// Get user conversations
exports.getConversations = async (req, res) => {
    try {
        console.log('📝 Fetching conversations for user:', req.userId);
        const conversations = await Chat.getUserConversations(req.userId);
        console.log('✅ Found', conversations.length, 'conversations');
        res.json({ success: true, data: conversations });
    } catch (error) {
        console.error('❌ Get conversations error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get conversation messages
exports.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { limit = 50, offset = 0 } = req.query;
        
        console.log('📝 Fetching messages for conversation:', conversationId);
        
        // Check if user is in conversation
        const participants = await Chat.getParticipants(conversationId);
        if (!participants.find(p => p.id === req.userId)) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const messages = await Chat.getMessages(conversationId, limit, offset);
        await Chat.markAsRead(conversationId, req.userId);

        res.json({ success: true, data: messages });
    } catch (error) {
        console.error('❌ Get messages error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Send message
exports.sendMessage = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { message, message_type = 'text', media_url } = req.body;

        console.log('📝 Sending message to conversation:', conversationId);
        
        // Check if user is in conversation
        const participants = await Chat.getParticipants(conversationId);
        if (!participants.find(p => p.id === req.userId)) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        if (!message && !media_url) {
            return res.status(400).json({ success: false, message: 'Message or media is required' });
        }

        const messageId = await Chat.sendMessage(
            conversationId,
            req.userId,
            message || '',
            message_type,
            media_url || null
        );

        res.json({ 
            success: true, 
            data: { messageId },
            message: 'Message sent successfully'
        });
    } catch (error) {
        console.error('❌ Send message error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Start conversation
exports.startConversation = async (req, res) => {
    try {
        const { user_id } = req.body;
        
        if (!user_id) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        console.log('📝 Starting conversation between users:', req.userId, 'and', user_id);
        
        // Check if user exists
        const pool = require('../config/database');
        const [users] = await pool.execute('SELECT id FROM users WHERE id = ?', [user_id]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if conversation already exists
        const conversations = await Chat.getUserConversations(req.userId);
        const existing = conversations.find(c => {
            const names = c.participant_names ? c.participant_names.split(',') : [];
            return names.includes(user_id.toString());
        });

        if (existing) {
            return res.json({ 
                success: true, 
                data: { conversationId: existing.id },
                message: 'Existing conversation found'
            });
        }

        // Create new conversation
        const conversationId = await Chat.createConversation('direct');
        await Chat.addParticipant(conversationId, req.userId);
        await Chat.addParticipant(conversationId, user_id);

        res.json({ 
            success: true, 
            data: { conversationId },
            message: 'Conversation started successfully'
        });
    } catch (error) {
        console.error('❌ Start conversation error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Mark as read
exports.markAsRead = async (req, res) => {
    try {
        const { conversationId } = req.params;
        console.log('📝 Marking conversation as read:', conversationId);
        
        await Chat.markAsRead(conversationId, req.userId);
        res.json({ success: true, message: 'Marked as read' });
    } catch (error) {
        console.error('❌ Mark as read error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};