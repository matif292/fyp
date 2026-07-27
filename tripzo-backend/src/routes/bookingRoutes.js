const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
    createBooking,
    getMyBookings,
    getHostelBookings,
    getBooking,
    updateBookingStatus,
    cancelBooking,
    updatePaymentStatus
} = require('../controllers/bookingController');

// ============================================
// Booking Routes
// ============================================

// 1. Create booking (Traveler only)
router.post('/', auth, authorize('traveler'), createBooking);

// 2. Get my bookings (Traveler only)
router.get('/my-bookings', auth, authorize('traveler'), getMyBookings);

// 3. Get hostel bookings (Owner only)
router.get('/hostel/:hostelId', auth, authorize('owner'), getHostelBookings);

// 4. Get single booking (Traveler/Owner/Admin)
router.get('/:id', auth, getBooking);

// 5. Update booking status (Owner/Admin)
router.put('/:id/status', auth, authorize('owner', 'admin'), updateBookingStatus);

// 6. Cancel booking (Traveler only)
router.put('/:id/cancel', auth, authorize('traveler'), cancelBooking);

// 7. Update payment status (Owner/Admin)
router.put('/:id/payment', auth, authorize('owner', 'admin'), updatePaymentStatus);

module.exports = router;