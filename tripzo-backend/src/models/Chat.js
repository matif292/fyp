// const pool = require('../config/database');

// class Chat {
//     // Create conversation
//     static async createConversation(type = 'direct') {
//         try {
//             const query = 'INSERT INTO conversations (type) VALUES (?)';
//             const [result] = await pool.execute(query, [type]);
//             console.log(`✅ Created conversation ${result.insertId}`);
//             return result.insertId;
//         } catch (error) {
//             console.error('❌ Error creating conversation:', error);
//             throw error;
//         }
//     }

//     // Add participant - WITH DUPLICATE CHECK
//     static async addParticipant(conversationId, userId, role = 'member') {
//         try {
//             // Check if already exists
//             const [existing] = await pool.execute(
//                 'SELECT * FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
//                 [conversationId, userId]
//             );
            
//             if (existing.length > 0) {
//                 console.log(`⚠️ User ${userId} already in conversation ${conversationId}`);
//                 return true;
//             }
            
//             const query = `
//                 INSERT INTO conversation_participants (conversation_id, user_id, role)
//                 VALUES (?, ?, ?)
//             `;
//             await pool.execute(query, [conversationId, userId, role]);
//             console.log(`✅ Added user ${userId} to conversation ${conversationId}`);
//             return true;
//         } catch (error) {
//             if (error.code === 'ER_DUP_ENTRY') {
//                 console.log(`⚠️ User ${userId} already in conversation ${conversationId} (duplicate ignored)`);
//                 return true;
//             }
//             console.error('❌ Error adding participant to conversation:', error);
//             throw error;
//         }
//     }

//     // Send message
//     static async sendMessage(conversationId, senderId, message, messageType = 'text', mediaUrl = null) {
//         try {
//             const query = `
//                 INSERT INTO messages (conversation_id, sender_id, message, message_type, media_url)
//                 VALUES (?, ?, ?, ?, ?)
//             `;
//             const [result] = await pool.execute(query, [conversationId, senderId, message, messageType, mediaUrl]);
//             await pool.execute('UPDATE conversations SET updated_at = NOW() WHERE id = ?', [conversationId]);
//             return result.insertId;
//         } catch (error) {
//             console.error('❌ Error sending message:', error);
//             throw error;
//         }
//     }

//     // Get messages
//     static async getMessages(conversationId, limit = 50, offset = 0) {
//         try {
//             const query = `
//                 SELECT m.*, u.full_name as sender_name, u.profile_photo
//                 FROM messages m
//                 JOIN users u ON m.sender_id = u.id
//                 WHERE m.conversation_id = ?
//                 ORDER BY m.created_at DESC
//                 LIMIT ? OFFSET ?
//             `;
//             const [rows] = await pool.execute(query, [conversationId, parseInt(limit), parseInt(offset)]);
//             return rows.reverse();
//         } catch (error) {
//             console.error('❌ Error getting messages:', error);
//             return [];
//         }
//     }

//     // Get user conversations
//     static async getUserConversations(userId) {
//         try {
//             const query = `
//                 SELECT c.*, 
//                        GROUP_CONCAT(DISTINCT u.full_name) as participant_names,
//                        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ?) as unread_count
//                 FROM conversations c
//                 JOIN conversation_participants cp ON c.id = cp.conversation_id
//                 JOIN conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id != ?
//                 JOIN users u ON cp2.user_id = u.id
//                 WHERE cp.user_id = ?
//                 GROUP BY c.id
//                 ORDER BY c.updated_at DESC
//             `;
//             const [rows] = await pool.execute(query, [userId, userId, userId]);
//             return rows;
//         } catch (error) {
//             console.error('❌ Error getting user conversations:', error);
//             return [];
//         }
//     }

//     // Mark as read
//     static async markAsRead(conversationId, userId) {
//         try {
//             await pool.execute('UPDATE conversations SET updated_at = NOW() WHERE id = ?', [conversationId]);
//             return true;
//         } catch (error) {
//             console.error('❌ Error marking as read:', error);
//             throw error;
//         }
//     }

//     // Get conversation participants
//     static async getParticipants(conversationId) {
//         try {
//             const query = `
//                 SELECT u.id, u.full_name, u.email, u.profile_photo
//                 FROM conversation_participants cp
//                 JOIN users u ON cp.user_id = u.id
//                 WHERE cp.conversation_id = ?
//             `;
//             const [rows] = await pool.execute(query, [conversationId]);
//             return rows;
//         } catch (error) {
//             console.error('❌ Error getting participants:', error);
//             return [];
//         }
//     }

//     // Get conversation by ID
//     static async getConversation(conversationId) {
//         try {
//             const query = 'SELECT * FROM conversations WHERE id = ?';
//             const [rows] = await pool.execute(query, [conversationId]);
//             return rows[0];
//         } catch (error) {
//             console.error('❌ Error getting conversation:', error);
//             throw error;
//         }
//     }
// }

// module.exports = Chat;



const pool = require('../config/database');

class Chat {
    static async createConversation(type = 'direct') {
        try {
            const query = 'INSERT INTO conversations (type) VALUES (?)';
            const [result] = await pool.execute(query, [type]);
            console.log(`✅ Created conversation ${result.insertId}`);
            return result.insertId;
        } catch (error) {
            console.error('❌ Error creating conversation:', error);
            throw error;
        }
    }

    static async addParticipant(conversationId, userId, role = 'member') {
        try {
            const [existing] = await pool.execute(
                'SELECT * FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
                [conversationId, userId]
            );
            
            if (existing.length > 0) {
                console.log(`⚠️ User ${userId} already in conversation ${conversationId}`);
                return true;
            }
            
            const query = `
                INSERT INTO conversation_participants (conversation_id, user_id, role)
                VALUES (?, ?, ?)
            `;
            await pool.execute(query, [conversationId, userId, role]);
            console.log(`✅ Added user ${userId} to conversation ${conversationId}`);
            return true;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return true;
            }
            console.error('❌ Error adding participant:', error);
            throw error;
        }
    }

    static async removeParticipant(conversationId, userId) {
        try {
            await pool.execute(
                'DELETE FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
                [conversationId, userId]
            );
            return true;
        } catch (error) {
            console.error('❌ Error removing participant:', error);
            throw error;
        }
    }

    static async sendMessage(conversationId, senderId, message, messageType = 'text', mediaUrl = null) {
        try {
            const query = `
                INSERT INTO messages (conversation_id, sender_id, message, message_type, media_url)
                VALUES (?, ?, ?, ?, ?)
            `;
            const [result] = await pool.execute(query, [conversationId, senderId, message, messageType, mediaUrl]);
            await pool.execute('UPDATE conversations SET updated_at = NOW() WHERE id = ?', [conversationId]);
            return result.insertId;
        } catch (error) {
            console.error('❌ Error sending message:', error);
            throw error;
        }
    }

    static async getMessages(conversationId, limit = 50, offset = 0) {
        try {
            const query = `
                SELECT m.*, u.full_name as sender_name, u.profile_photo
                FROM messages m
                JOIN users u ON m.sender_id = u.id
                WHERE m.conversation_id = ?
                ORDER BY m.created_at DESC
                LIMIT ? OFFSET ?
            `;
            const [rows] = await pool.execute(query, [conversationId, parseInt(limit), parseInt(offset)]);
            return rows.reverse();
        } catch (error) {
            console.error('❌ Error getting messages:', error);
            return [];
        }
    }

    static async getUserConversations(userId) {
        try {
            const query = `
                SELECT c.*, 
                       GROUP_CONCAT(DISTINCT u.full_name) as participant_names,
                       (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ?) as unread_count
                FROM conversations c
                JOIN conversation_participants cp ON c.id = cp.conversation_id
                JOIN conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id != ?
                JOIN users u ON cp2.user_id = u.id
                WHERE cp.user_id = ?
                GROUP BY c.id
                ORDER BY c.updated_at DESC
            `;
            const [rows] = await pool.execute(query, [userId, userId, userId]);
            return rows;
        } catch (error) {
            console.error('❌ Error getting user conversations:', error);
            return [];
        }
    }

    static async markAsRead(conversationId, userId) {
        try {
            await pool.execute('UPDATE conversations SET updated_at = NOW() WHERE id = ?', [conversationId]);
            return true;
        } catch (error) {
            console.error('❌ Error marking as read:', error);
            throw error;
        }
    }

    static async getParticipants(conversationId) {
        try {
            const query = `
                SELECT u.id, u.full_name, u.email, u.profile_photo
                FROM conversation_participants cp
                JOIN users u ON cp.user_id = u.id
                WHERE cp.conversation_id = ?
            `;
            const [rows] = await pool.execute(query, [conversationId]);
            return rows;
        } catch (error) {
            console.error('❌ Error getting participants:', error);
            return [];
        }
    }

    static async getConversation(conversationId) {
        try {
            const query = 'SELECT * FROM conversations WHERE id = ?';
            const [rows] = await pool.execute(query, [conversationId]);
            return rows[0];
        } catch (error) {
            console.error('❌ Error getting conversation:', error);
            throw error;
        }
    }
}

module.exports = Chat;