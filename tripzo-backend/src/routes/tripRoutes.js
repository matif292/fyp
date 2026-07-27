const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
    createTripPlan,
    getTripPlans,
    getTripPlan,
    agreeToTrip,
    declineTrip,
    getTripGroups,
    addMemory,
    getMemories,
    getJoinRequests,
    approveJoinRequest,
    rejectJoinRequest,
    getMyStatuses,
    leaveGroup
} = require('../controllers/tripController');

// ============================================
// PUBLIC ROUTES (Specific first, dynamic last)
// ============================================

// Get all trip plans
router.get('/', getTripPlans);

// Get trip groups - MUST BE BEFORE /:id
router.get('/groups', auth, getTripGroups);

// Get my participant statuses (agreed/pending/declined per plan) - MUST BE BEFORE /:id
router.get('/my-statuses', auth, getMyStatuses);

// Get single trip plan - DYNAMIC (must be last)
router.get('/:id', getTripPlan);

// ============================================
// PROTECTED ROUTES
// ============================================

// All routes below require authentication
router.use(auth);

// Create trip plan
router.post('/', createTripPlan);

// Request to join a trip (host approval required unless you're the creator)
router.post('/:id/agree', agreeToTrip);

// Decline / withdraw from a trip
router.post('/:id/decline', declineTrip);

// Join request management (host only)
router.get('/:id/join-requests', getJoinRequests);
router.put('/:id/join-requests/:userId/approve', approveJoinRequest);
router.put('/:id/join-requests/:userId/reject', rejectJoinRequest);

// Leave a trip group
router.post('/groups/:groupId/leave', leaveGroup);

// Memories (specific routes)
router.post('/groups/:groupId/memories', addMemory);
router.get('/groups/:groupId/memories', getMemories);

module.exports = router;
