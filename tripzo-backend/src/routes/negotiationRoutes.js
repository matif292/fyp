const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
    sendNegotiation,
    getMyNegotiations,
    acceptCounter,
    getOwnerNegotiations,
    respondToNegotiation,
    getRules,
    updateRules,
} = require('../controllers/negotiationController');

// Traveler routes
router.post('/', auth, authorize('traveler'), sendNegotiation);
router.get('/my', auth, authorize('traveler'), getMyNegotiations);
router.post('/:id/accept-counter', auth, authorize('traveler'), acceptCounter);

// Owner routes
router.get('/hostel-owner', auth, authorize('owner'), getOwnerNegotiations);
router.put('/:id/respond', auth, authorize('owner'), respondToNegotiation);
router.get('/hostel/:hostelId/rules', auth, authorize('owner'), getRules);
router.put('/hostel/:hostelId/rules', auth, authorize('owner'), updateRules);

module.exports = router;
