const pool = require('../config/database');
const Chat = require('./Chat');

class TripPlan {
    // Create trip plan
    static async create(data) {
        try {
            const {
                user_id,
                title,
                description,
                destination,
                start_date,
                end_date,
                budget_estimate,
                max_participants = 10
            } = data;

            const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000);

            const query = `
                INSERT INTO trip_plans 
                (user_id, title, description, destination, start_date, end_date, 
                 budget_estimate, max_participants, deadline)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const [result] = await pool.execute(query, [
                user_id, title, description, destination, start_date, end_date,
                budget_estimate || null, max_participants, deadline
            ]);

            await this.addParticipant(result.insertId, user_id, 'agreed');
            return result.insertId;
        } catch (error) {
            console.error('Error creating trip plan:', error);
            throw error;
        }
    }

    // Add participant - WITH DUPLICATE HANDLING
    static async addParticipant(tripPlanId, userId, status = 'pending') {
        try {
            console.log(`📝 Adding participant ${userId} to trip plan ${tripPlanId} with status ${status}`);
            
            // 1. Check if trip plan exists
            const [plan] = await pool.execute('SELECT * FROM trip_plans WHERE id = ?', [tripPlanId]);
            if (plan.length === 0) {
                throw new Error(`Trip plan ${tripPlanId} not found`);
            }
            console.log(`✅ Plan found: ${plan[0].title}`);

            // 2. Check if user already exists as participant
            const [existing] = await pool.execute(
                'SELECT * FROM trip_plan_participants WHERE trip_plan_id = ? AND user_id = ?',
                [tripPlanId, userId]
            );
            
            if (existing.length > 0) {
                console.log(`⚠️ User ${userId} already exists as participant with status ${existing[0].status}`);
                if (existing[0].status === status) {
                    const [groups] = await pool.execute(
                        'SELECT * FROM trip_groups WHERE trip_plan_id = ?',
                        [tripPlanId]
                    );
                    return { groupId: groups.length > 0 ? groups[0].id : null };
                }
            }

            // 3. Insert or update participant
            const query = `
                INSERT INTO trip_plan_participants (trip_plan_id, user_id, status)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE status = VALUES(status), responded_at = NOW()
            `;
            await pool.execute(query, [tripPlanId, userId, status]);
            console.log(`✅ Participant added/updated`);

            // 4. If status is 'agreed', handle group creation
            if (status === 'agreed') {
                // Update participant count
                if (existing.length === 0 || existing[0].status !== 'agreed') {
                    await pool.execute(`
                        UPDATE trip_plans 
                        SET current_participants = current_participants + 1 
                        WHERE id = ?
                    `, [tripPlanId]);
                    console.log(`✅ Updated participant count`);
                }

                // 5. Check if group already exists
                const [existingGroups] = await pool.execute(
                    'SELECT id, conversation_id FROM trip_groups WHERE trip_plan_id = ?',
                    [tripPlanId]
                );

                // 6. If no group exists, create one
                if (existingGroups.length === 0) {
                    console.log(`📝 Creating new group for plan ${tripPlanId}`);
                    
                    try {
                        // Create trip group
                        const groupQuery = `
                            INSERT INTO trip_groups (trip_plan_id, name, start_date, end_date)
                            VALUES (?, ?, ?, ?)
                        `;
                        const [group] = await pool.execute(groupQuery, [
                            tripPlanId,
                            `${plan[0].destination} Trip - ${new Date().toLocaleDateString()}`,
                            plan[0].start_date,
                            plan[0].end_date
                        ]);

                        const groupId = group.insertId;
                        console.log(`✅ Created trip group ${groupId}`);

                        // Create conversation
                        const conversationId = await Chat.createConversation('group');
                        console.log(`✅ Created conversation ${conversationId}`);
                        
                        await pool.execute(
                            'UPDATE trip_groups SET conversation_id = ? WHERE id = ?',
                            [conversationId, groupId]
                        );

                        // Get all agreed participants
                        const participants = await pool.execute(
                            'SELECT user_id FROM trip_plan_participants WHERE trip_plan_id = ? AND status = "agreed"',
                            [tripPlanId]
                        );
                        console.log(`👥 Found ${participants[0].length} participants`);

                        // Add participants to conversation
                        for (const p of participants[0]) {
                            try {
                                await Chat.addParticipant(conversationId, p.user_id);
                                console.log(`✅ Added user ${p.user_id} to conversation`);
                            } catch (err) {
                                if (err.code === 'ER_DUP_ENTRY') {
                                    console.log(`⚠️ User ${p.user_id} already in conversation`);
                                } else {
                                    throw err;
                                }
                            }
                        }

                        // Update trip plan status
                        await pool.execute(
                            'UPDATE trip_plans SET status = "open" WHERE id = ?',
                            [tripPlanId]
                        );

                        console.log(`✅ Group ${groupId} created with ${participants[0].length} participants`);
                        return { groupId, conversationId };
                        
                    } catch (groupError) {
                        console.error('❌ Error creating group:', groupError);
                        throw groupError;
                    }
                } else {
                    // Group exists, add new participant to conversation
                    const group = existingGroups[0];
                    if (group.conversation_id) {
                        try {
                            await Chat.addParticipant(group.conversation_id, userId);
                            console.log(`✅ Added user ${userId} to existing conversation ${group.conversation_id}`);
                        } catch (chatError) {
                            if (chatError.code === 'ER_DUP_ENTRY') {
                                console.log(`⚠️ User ${userId} already in conversation`);
                            } else {
                                throw chatError;
                            }
                        }
                    }
                    return { groupId: group.id };
                }
            }

            return true;
        } catch (error) {
            console.error('❌ Error adding participant:', error);
            throw error;
        }
    }

    // Get trip plans
    static async getPlans(filters = {}) {
        try {
            let query = `
                SELECT tp.*, u.full_name as creator_name,
                       (SELECT COUNT(*) FROM trip_plan_participants WHERE trip_plan_id = tp.id AND status = 'agreed') as agreed_count
                FROM trip_plans tp
                JOIN users u ON tp.user_id = u.id
                WHERE tp.status IN ('planning', 'open')
            `;
            const params = [];

            if (filters.destination) {
                query += ' AND tp.destination = ?';
                params.push(filters.destination);
            }

            if (filters.userId) {
                query += ` AND EXISTS (
                    SELECT 1 FROM trip_plan_participants 
                    WHERE trip_plan_id = tp.id AND user_id = ?
                )`;
                params.push(filters.userId);
            }

            query += ' ORDER BY tp.created_at DESC LIMIT ? OFFSET ?';
            params.push(parseInt(filters.limit) || 20, parseInt(filters.offset) || 0);

            const [rows] = await pool.execute(query, params);
            return rows;
        } catch (error) {
            console.error('Error getting plans:', error);
            throw error;
        }
    }

    // Get single plan
    static async getPlan(id) {
        try {
            const query = `
                SELECT tp.*, u.full_name as creator_name,
                       (SELECT COUNT(*) FROM trip_plan_participants WHERE trip_plan_id = tp.id AND status = 'agreed') as agreed_count
                FROM trip_plans tp
                JOIN users u ON tp.user_id = u.id
                WHERE tp.id = ?
            `;
            const [rows] = await pool.execute(query, [id]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error getting plan:', error);
            throw error;
        }
    }

    // Get trip groups for user
    // Get trip groups for user - COMPLETELY FIXED
// Get trip groups for user - SIMPLEST VERSION
    // Get trip groups for user - WITH DEBUG LOGGING
    // Get trip groups for user - SHOW ALL GROUPS
    static async getTripGroups(userId) {
        try {
            console.log(`📝 Fetching trip groups for user ${userId}`);

            // Only groups the user actually agreed to join — not every
            // group in the database (this used to return everyone's groups).
            const [groups] = await pool.execute(`
                SELECT tg.*,
                    tp.destination,
                    tp.title as plan_title,
                    (SELECT COUNT(*) FROM trip_memories WHERE trip_group_id = tg.id) as memory_count,
                    (SELECT COUNT(*) FROM conversation_participants WHERE conversation_id = tg.conversation_id) as participant_count
                FROM trip_groups tg
                INNER JOIN trip_plans tp ON tg.trip_plan_id = tp.id
                WHERE EXISTS (
                    SELECT 1 FROM trip_plan_participants tpp
                    WHERE tpp.trip_plan_id = tg.trip_plan_id
                      AND tpp.user_id = ?
                      AND tpp.status = 'agreed'
                )
                ORDER BY tg.created_at DESC
            `, [userId]);

            console.log(`✅ Found ${groups.length} groups for user ${userId}`);
            return groups;
        } catch (error) {
            console.error('❌ Error getting trip groups:', error);
            return [];
        }
    }
    // Add memory
    static async addMemory(groupId, userId, mediaType, mediaUrl, caption, location) {
        try {
            const [groups] = await pool.execute('SELECT id FROM trip_groups WHERE id = ?', [groupId]);
            if (groups.length === 0) {
                throw new Error('Trip group not found');
            }

            const query = `
                INSERT INTO trip_memories (trip_group_id, user_id, media_type, media_url, caption, location)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const [result] = await pool.execute(query, [groupId, userId, mediaType, mediaUrl, caption || '', location || '']);
            return result.insertId;
        } catch (error) {
            console.error('Error adding memory:', error);
            throw error;
        }
    }

    // Get pending join requests for a trip plan
    static async getJoinRequests(tripPlanId) {
        try {
            const [rows] = await pool.execute(`
                SELECT tpp.trip_plan_id, tpp.user_id, tpp.status, tpp.created_at,
                       u.full_name, u.email, u.profile_photo
                FROM trip_plan_participants tpp
                JOIN users u ON tpp.user_id = u.id
                WHERE tpp.trip_plan_id = ? AND tpp.status = 'pending'
                ORDER BY tpp.created_at ASC
            `, [tripPlanId]);
            return rows;
        } catch (error) {
            console.error('Error getting join requests:', error);
            throw error;
        }
    }

    // Get this user's participant status across all trip plans they've interacted with
    static async getMyStatuses(userId) {
        try {
            const [rows] = await pool.execute(
                'SELECT trip_plan_id, status FROM trip_plan_participants WHERE user_id = ?',
                [userId]
            );
            return rows;
        } catch (error) {
            console.error('Error getting my trip statuses:', error);
            throw error;
        }
    }

    // Leave a trip group (undo an 'agreed' membership)
    static async leaveGroup(groupId, userId) {
        try {
            const [groups] = await pool.execute('SELECT * FROM trip_groups WHERE id = ?', [groupId]);
            if (groups.length === 0) {
                throw new Error('Trip group not found');
            }
            const group = groups[0];

            const [participant] = await pool.execute(
                'SELECT * FROM trip_plan_participants WHERE trip_plan_id = ? AND user_id = ? AND status = "agreed"',
                [group.trip_plan_id, userId]
            );
            if (participant.length === 0) {
                throw new Error('You are not a member of this trip group');
            }

            await pool.execute(
                'UPDATE trip_plan_participants SET status = "declined", responded_at = NOW() WHERE trip_plan_id = ? AND user_id = ?',
                [group.trip_plan_id, userId]
            );
            await pool.execute(
                'UPDATE trip_plans SET current_participants = GREATEST(current_participants - 1, 0) WHERE id = ?',
                [group.trip_plan_id]
            );
            if (group.conversation_id) {
                await pool.execute(
                    'DELETE FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
                    [group.conversation_id, userId]
                );
            }
            return true;
        } catch (error) {
            console.error('Error leaving group:', error);
            throw error;
        }
    }

    // Get memories
    static async getMemories(groupId) {
        try {
            const query = `
                SELECT tm.*, u.full_name as user_name, u.profile_photo
                FROM trip_memories tm
                JOIN users u ON tm.user_id = u.id
                WHERE tm.trip_group_id = ?
                ORDER BY tm.created_at DESC
            `;
            const [rows] = await pool.execute(query, [groupId]);
            return rows;
        } catch (error) {
            console.error('Error getting memories:', error);
            return [];
        }
    }
}

module.exports = TripPlan;