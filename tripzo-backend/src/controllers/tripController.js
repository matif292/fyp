// const TripPlan = require('../models/TripPlan');

// // Create trip plan
// exports.createTripPlan = async (req, res) => {
//     try {
//         console.log('📝 Creating trip plan for user:', req.userId);
//         const data = { ...req.body, user_id: req.userId };
//         const planId = await TripPlan.create(data);
        
//         res.status(201).json({ 
//             success: true, 
//             data: { planId },
//             message: 'Trip plan created successfully!'
//         });
//     } catch (error) {
//         console.error('❌ Create trip plan error:', error);
//         res.status(500).json({ 
//             success: false, 
//             message: 'Server error',
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };

// // Get trip plans
// exports.getTripPlans = async (req, res) => {
//     try {
//         console.log('📝 Fetching trip plans');
//         const filters = { ...req.query };
//         if (req.query.user_id) {
//             filters.userId = req.query.user_id;
//         }
//         const plans = await TripPlan.getPlans(filters);
//         res.json({ success: true, data: plans });
//     } catch (error) {
//         console.error('❌ Get trip plans error:', error);
//         res.status(500).json({ 
//             success: false, 
//             message: 'Server error',
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };

// // Get single trip plan
// exports.getTripPlan = async (req, res) => {
//     try {
//         const { id } = req.params;
//         console.log('📝 Fetching trip plan:', id);
        
//         const plan = await TripPlan.getPlan(id);
//         if (!plan) {
//             return res.status(404).json({ success: false, message: 'Plan not found' });
//         }
//         res.json({ success: true, data: plan });
//     } catch (error) {
//         console.error('❌ Get trip plan error:', error);
//         res.status(500).json({ 
//             success: false, 
//             message: 'Server error',
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };

// // Agree to trip
// exports.agreeToTrip = async (req, res) => {
//     try {
//         const { id } = req.params;
//         console.log(`========================================`);
//         console.log(`📝 User ${req.userId} agreeing to trip ${id}`);
//         console.log(`========================================`);

//         const plan = await TripPlan.getPlan(id);
//         if (!plan) {
//             console.log(`❌ Plan ${id} not found`);
//             return res.status(404).json({ success: false, message: 'Plan not found' });
//         }
//         console.log(`✅ Plan found: ${plan.title}`);

//         const result = await TripPlan.addParticipant(id, req.userId, 'agreed');
//         console.log(`✅ Participant added, result:`, result);
        
//         const groups = await TripPlan.getTripGroups(req.userId);
//         const group = groups.find(g => g.trip_plan_id === parseInt(id));

//         console.log(`✅ Group found:`, group ? group.id : 'No group yet');
//         console.log(`========================================`);

//         res.json({ 
//             success: true, 
//             message: group ? 'You agreed to join this trip! A group has been created.' : 'You agreed to join this trip!',
//             data: { group: group || null }
//         });
//     } catch (error) {
//         console.error('❌ Agree to trip error:', error);
//         console.error('Stack:', error.stack);
//         res.status(500).json({
//             success: false,
//             message: 'Server error',
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined,
//             stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
//         });
//     }
// };

// // Decline trip
// exports.declineTrip = async (req, res) => {
//     try {
//         const { id } = req.params;
//         console.log(`📝 User ${req.userId} declining trip ${id}`);
        
//         await TripPlan.addParticipant(id, req.userId, 'declined');
//         res.json({ success: true, message: 'You declined this trip' });
//     } catch (error) {
//         console.error('❌ Decline trip error:', error);
//         res.status(500).json({ 
//             success: false, 
//             message: 'Server error',
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };

// // Get trip groups
// exports.getTripGroups = async (req, res) => {
//     try {
//         console.log(`📝 Fetching trip groups for user: ${req.userId}`);
        
//         const groups = await TripPlan.getTripGroups(req.userId);
        
//         res.json({ 
//             success: true, 
//             data: groups || [],
//             message: groups && groups.length > 0 ? `Found ${groups.length} trip group(s)` : 'No trip groups yet'
//         });
//     } catch (error) {
//         console.error('❌ Get trip groups error:', error);
//         res.status(500).json({ 
//             success: false, 
//             message: 'Server error',
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };

// // Add memory
// exports.addMemory = async (req, res) => {
//     try {
//         const { groupId } = req.params;
//         const { media_type, media_url, caption, location } = req.body;
        
//         console.log(`📝 Adding memory to group ${groupId}`);
        
//         if (!media_type || !media_url) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: 'media_type and media_url are required' 
//             });
//         }
        
//         const memoryId = await TripPlan.addMemory(
//             groupId,
//             req.userId,
//             media_type,
//             media_url,
//             caption || '',
//             location || ''
//         );
        
//         res.status(201).json({ 
//             success: true, 
//             data: { memoryId },
//             message: 'Memory added successfully!'
//         });
//     } catch (error) {
//         console.error('❌ Add memory error:', error);
        
//         if (error.message === 'Trip group not found') {
//             return res.status(404).json({ 
//                 success: false, 
//                 message: 'Trip group not found' 
//             });
//         }
        
//         res.status(500).json({ 
//             success: false, 
//             message: 'Server error',
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };

// // Get memories
// exports.getMemories = async (req, res) => {
//     try {
//         const { groupId } = req.params;
//         console.log(`📝 Fetching memories for group ${groupId}`);
        
//         const memories = await TripPlan.getMemories(groupId);
//         res.json({ success: true, data: memories });
//     } catch (error) {
//         console.error('❌ Get memories error:', error);
//         res.status(500).json({ 
//             success: false, 
//             message: 'Server error',
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };



const TripPlan = require('../models/TripPlan');

// Create trip plan
exports.createTripPlan = async (req, res) => {
    try {
        console.log('📝 Creating trip plan for user:', req.userId);
        const data = { ...req.body, user_id: req.userId };
        const planId = await TripPlan.create(data);
        
        res.status(201).json({ 
            success: true, 
            data: { planId },
            message: 'Trip plan created successfully!'
        });
    } catch (error) {
        console.error('❌ Create trip plan error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get trip plans
exports.getTripPlans = async (req, res) => {
    try {
        console.log('📝 Fetching trip plans');
        const filters = { ...req.query };
        if (req.query.user_id) {
            filters.userId = req.query.user_id;
        }
        const plans = await TripPlan.getPlans(filters);
        res.json({ success: true, data: plans });
    } catch (error) {
        console.error('❌ Get trip plans error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get single trip plan
exports.getTripPlan = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('📝 Fetching trip plan:', id);
        
        const plan = await TripPlan.getPlan(id);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        res.json({ success: true, data: plan });
    } catch (error) {
        console.error('❌ Get trip plan error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Agree to trip — for the creator this is a no-op (they're auto-agreed on create).
// For anyone else this now sends a JOIN REQUEST that the trip host must approve,
// instead of joining the group immediately.
exports.agreeToTrip = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`========================================`);
        console.log(`📝 User ${req.userId} requesting to join trip ${id}`);
        console.log(`========================================`);

        const plan = await TripPlan.getPlan(id);
        if (!plan) {
            console.log(`❌ Plan ${id} not found`);
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        console.log(`✅ Plan found: ${plan.title}`);

        if (plan.user_id === req.userId) {
            return res.json({
                success: true,
                message: 'You created this trip — you\'re already in.',
                data: { alreadyMember: true }
            });
        }

        const statuses = await TripPlan.getMyStatuses(req.userId);
        const existing = statuses.find((s) => s.trip_plan_id === parseInt(id));
        if (existing?.status === 'agreed') {
            return res.json({ success: true, message: 'You\'re already a member of this trip.', data: { alreadyMember: true } });
        }
        if (existing?.status === 'pending') {
            return res.json({ success: true, message: 'Your join request is already pending.', data: { pending: true } });
        }

        await TripPlan.addParticipant(id, req.userId, 'pending');
        console.log(`✅ Join request recorded for user ${req.userId} on trip ${id}`);
        console.log(`========================================`);

        res.json({
            success: true,
            message: 'Join request sent! The trip host will review it.',
            data: { pending: true }
        });
    } catch (error) {
        console.error('❌ Agree to trip error:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Get pending join requests for a trip plan (host only)
exports.getJoinRequests = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await TripPlan.getPlan(id);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        if (plan.user_id !== req.userId) {
            return res.status(403).json({ success: false, message: 'Only the trip host can view join requests' });
        }
        const requests = await TripPlan.getJoinRequests(id);
        res.json({ success: true, data: requests });
    } catch (error) {
        console.error('❌ Get join requests error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Approve a pending join request (host only)
exports.approveJoinRequest = async (req, res) => {
    try {
        const { id, userId } = req.params;
        const plan = await TripPlan.getPlan(id);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        if (plan.user_id !== req.userId) {
            return res.status(403).json({ success: false, message: 'Only the trip host can approve join requests' });
        }
        const result = await TripPlan.addParticipant(id, parseInt(userId), 'agreed');
        res.json({ success: true, message: 'Join request approved', data: result });
    } catch (error) {
        console.error('❌ Approve join request error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Reject a pending join request (host only)
exports.rejectJoinRequest = async (req, res) => {
    try {
        const { id, userId } = req.params;
        const plan = await TripPlan.getPlan(id);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        if (plan.user_id !== req.userId) {
            return res.status(403).json({ success: false, message: 'Only the trip host can reject join requests' });
        }
        await TripPlan.addParticipant(id, parseInt(userId), 'declined');
        res.json({ success: true, message: 'Join request rejected' });
    } catch (error) {
        console.error('❌ Reject join request error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get the current user's participant status across all trip plans
exports.getMyStatuses = async (req, res) => {
    try {
        const statuses = await TripPlan.getMyStatuses(req.userId);
        res.json({ success: true, data: statuses });
    } catch (error) {
        console.error('❌ Get my statuses error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Leave a trip group
exports.leaveGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        await TripPlan.leaveGroup(groupId, req.userId);
        res.json({ success: true, message: 'You left the trip group' });
    } catch (error) {
        console.error('❌ Leave group error:', error);
        const status = error.message.includes('not a member') || error.message.includes('not found') ? 400 : 500;
        res.status(status).json({ success: false, message: error.message || 'Server error' });
    }
};

// Decline trip
exports.declineTrip = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`📝 User ${req.userId} declining trip ${id}`);
        
        await TripPlan.addParticipant(id, req.userId, 'declined');
        res.json({ success: true, message: 'You declined this trip' });
    } catch (error) {
        console.error('❌ Decline trip error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get trip groups
// Get trip groups - WITH BETTER ERROR HANDLING
// Get trip groups - COMPLETE FIX
exports.getTripGroups = async (req, res) => {
    try {
        console.log(`========================================`);
        console.log(`📝 GET TRIP GROUPS`);
        console.log(`User ID: ${req.userId}`);
        console.log(`========================================`);
        
        const groups = await TripPlan.getTripGroups(req.userId);
        
        console.log(`📊 Returning ${groups.length} groups`);
        
        res.json({ 
            success: true, 
            data: groups || [],
            count: groups ? groups.length : 0,
            message: groups && groups.length > 0 ? `Found ${groups.length} trip group(s)` : 'No trip groups yet'
        });
    } catch (error) {
        console.error('❌ Get trip groups error:', error);
        console.error('Stack:', error.stack);
        res.json({ 
            success: true, 
            data: [],
            count: 0,
            message: 'Error loading groups, please try again'
        });
    }
};
// Add memory
exports.addMemory = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { media_type, media_url, caption, location } = req.body;
        
        console.log(`📝 Adding memory to group ${groupId}`);
        
        if (!media_type || !media_url) {
            return res.status(400).json({ 
                success: false, 
                message: 'media_type and media_url are required' 
            });
        }
        
        const memoryId = await TripPlan.addMemory(
            groupId,
            req.userId,
            media_type,
            media_url,
            caption || '',
            location || ''
        );
        
        res.status(201).json({ 
            success: true, 
            data: { memoryId },
            message: 'Memory added successfully!'
        });
    } catch (error) {
        console.error('❌ Add memory error:', error);
        
        if (error.message === 'Trip group not found') {
            return res.status(404).json({ 
                success: false, 
                message: 'Trip group not found' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get memories
exports.getMemories = async (req, res) => {
    try {
        const { groupId } = req.params;
        console.log(`📝 Fetching memories for group ${groupId}`);
        
        const memories = await TripPlan.getMemories(groupId);
        res.json({ success: true, data: memories });
    } catch (error) {
        console.error('❌ Get memories error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};