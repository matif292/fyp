const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Hostel = require('../models/Hostel');
const RoomNotification = require('../models/RoomNotification');

// @desc    Add review
// @route   POST /api/reviews
// @access  Private (Traveler only)
exports.addReview = async (req, res) => {
    try {
        console.log('========================================');
        console.log('⭐ ADD REVIEW');
        console.log('========================================');
        console.log('User ID:', req.userId);
        console.log('Request Body:', req.body);

        const { booking_id, hostel_id, rating, comment } = req.body;

        // Validate required fields
        if (!booking_id || !hostel_id || !rating) {
            return res.status(400).json({
                success: false,
                message: 'Please provide booking_id, hostel_id, and rating'
            });
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        // Check if booking exists and belongs to user
        const booking = await Booking.findById(booking_id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (booking.traveler_id !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only review your own bookings'
            });
        }

        // Check if booking is confirmed or completed
        if (booking.status === 'pending' || booking.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'You can only review confirmed or completed bookings'
            });
        }

        // Check if hostel exists
        const hostel = await Hostel.findById(hostel_id);
        if (!hostel) {
            return res.status(404).json({
                success: false,
                message: 'Hostel not found'
            });
        }

        // Check if user already reviewed this booking
        const alreadyReviewed = await Review.hasReviewed(booking_id, req.userId);
        if (alreadyReviewed) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this booking'
            });
        }

        // Create review
        const reviewId = await Review.create({
            booking_id: parseInt(booking_id),
            user_id: req.userId,
            hostel_id: parseInt(hostel_id),
            rating: parseInt(rating),
            comment: comment || null
        });

        console.log('✅ Review created with ID:', reviewId);

        // Get the created review
        const newReview = await Review.findById(reviewId);

        RoomNotification.create({
            owner_id: hostel.owner_id,
            hostel_id: hostel.id,
            booking_id: parseInt(booking_id),
            type: 'review',
            message: `New ${rating}-star review for ${hostel.name}`
        }).catch((err) => console.error('Owner notification failed:', err.message));

        res.status(201).json({
            success: true,
            message: 'Review added successfully',
            data: newReview
        });

    } catch (error) {
        console.error('❌ Add review error:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get hostel reviews
// @route   GET /api/reviews/hostel/:hostelId
// @access  Public
exports.getHostelReviews = async (req, res) => {
    try {
        const { hostelId } = req.params;
        console.log('📝 Fetching reviews for hostel:', hostelId);
        
        // Check if hostel exists
        const hostel = await Hostel.findById(hostelId);
        if (!hostel) {
            return res.status(404).json({
                success: false,
                message: 'Hostel not found'
            });
        }

        // Get reviews
        const reviews = await Review.findByHostel(hostelId);

        // Get rating stats
        const stats = await Review.getHostelStats(hostelId);
        const sentiment = await Review.getHostelSentiment(hostelId);

        res.json({
            success: true,
            count: reviews.length,
            stats: stats,
            sentiment: sentiment,
            data: reviews
        });

    } catch (error) {
        console.error('❌ Get hostel reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get sentiment breakdown for a hostel's reviews
// @route   GET /api/reviews/hostel/:hostelId/sentiment
// @access  Public
exports.getHostelSentiment = async (req, res) => {
    try {
        const { hostelId } = req.params;
        const sentiment = await Review.getHostelSentiment(hostelId);
        res.json({ success: true, data: sentiment });
    } catch (error) {
        console.error('❌ Get hostel sentiment error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get my reviews
// @route   GET /api/reviews/my-reviews
// @access  Private (Traveler only)
exports.getMyReviews = async (req, res) => {
    try {
        console.log('📝 Fetching reviews for user:', req.userId);
        
        const reviews = await Review.findByUser(req.userId);

        res.json({
            success: true,
            count: reviews.length,
            data: reviews
        });

    } catch (error) {
        console.error('❌ Get my reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
exports.getReview = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('📝 Fetching review:', id);
        
        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        res.json({
            success: true,
            data: review
        });

    } catch (error) {
        console.error('❌ Get review error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private (Traveler only)
exports.updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        console.log('📝 Updating review:', { id, rating, comment });

        // Check if review exists
        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if user owns the review
        if (review.user_id !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own reviews'
            });
        }

        // Validate rating
        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        // Prepare update data
        const updateData = {};
        if (rating) updateData.rating = parseInt(rating);
        if (comment !== undefined) updateData.comment = comment;

        // Update review
        await Review.update(id, updateData);

        // Get updated review
        const updatedReview = await Review.findById(id);

        res.json({
            success: true,
            message: 'Review updated successfully',
            data: updatedReview
        });

    } catch (error) {
        console.error('❌ Update review error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Traveler only)
exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('📝 Deleting review:', id);

        // Check if review exists
        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if user owns the review
        if (review.user_id !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own reviews'
            });
        }

        // Delete review
        await Review.delete(id);

        res.json({
            success: true,
            message: 'Review deleted successfully'
        });

    } catch (error) {
        console.error('❌ Delete review error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};