const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
    addReview,
    getHostelReviews,
    getHostelSentiment,
    getMyReviews,
    getReview,
    updateReview,
    deleteReview
} = require('../controllers/reviewController');

// ============================================
// Review Routes
// ============================================

// 1. Public routes
router.get('/hostel/:hostelId/sentiment', getHostelSentiment);
router.get('/hostel/:hostelId', getHostelReviews);
router.get('/:id', getReview);

// 2. Protected routes (Traveler only)
router.post('/', auth, authorize('traveler'), addReview);
router.get('/my-reviews', auth, authorize('traveler'), getMyReviews);
router.put('/:id', auth, authorize('traveler'), updateReview);
router.delete('/:id', auth, authorize('traveler'), deleteReview);

module.exports = router;