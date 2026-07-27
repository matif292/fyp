const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
    createPackage,
    getHostelPackages,
    bookPackage,
    getPackageBookings
} = require('../controllers/packageController');

// Public routes
router.get('/hostel/:hostelId', getHostelPackages);

// Protected routes
router.use(auth);

// Book package (Traveler)
router.post('/:packageId/book', authorize('traveler'), bookPackage);

// Create package (Owner)
router.post('/', authorize('owner'), createPackage);

// Get package bookings (Owner)
router.get('/bookings/hostel/:hostelId', authorize('owner'), getPackageBookings);

module.exports = router;