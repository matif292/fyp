// // const express = require('express');
// // const router = express.Router();
// // const { auth, authorize } = require('../middleware/auth');
// // const { uploadMultiple } = require('../middleware/upload');
// // const {
// //     createHostel,
// //     getHostels,
// //     getHostel,
// //     updateHostel,
// //     getOwnerHostels,
// //     addRoomType,
// //     getRoomTypes  // ← Make sure this is imported
// // } = require('../controllers/hostelController');

// // // ============================================
// // // IMPORTANT: Specific routes BEFORE dynamic routes
// // // ============================================

// // // 1. Get owner's hostels (specific route)
// // router.get('/owner/hostels', auth, authorize('owner'), getOwnerHostels);

// // // 2. Get room types (specific route) - PUBLIC
// // router.get('/:hostelId/rooms', getRoomTypes);

// // // 3. Add room type (specific route) - OWNER ONLY
// // router.post('/:hostelId/rooms', auth, authorize('owner'), addRoomType);

// // // 4. Public routes (dynamic routes - put these LAST)
// // router.get('/', getHostels);
// // router.get('/:id', getHostel);

// // // 5. Protected routes (dynamic routes - put these LAST)
// // router.post('/', auth, authorize('owner'), uploadMultiple('photos', 10), createHostel);
// // router.put('/:id', auth, authorize('owner', 'admin'), updateHostel);

// // module.exports = router;


// const express = require('express');
// const router = express.Router();
// const { auth, authorize } = require('../middleware/auth');
// const { uploadMultiple } = require('../middleware/upload');
// const {
//     createHostel,
//     getHostels,
//     getHostel,
//     updateHostel,
//     getOwnerHostels,
//     addRoomType,
//     getRoomTypes
// } = require('../controllers/hostelController');

// // ============================================
// // IMPORTANT: Public routes FIRST (no auth required)
// // ============================================

// // 1. Get all hostels (PUBLIC)
// router.get('/', getHostels);

// // 2. Get single hostel (PUBLIC)
// router.get('/:id', getHostel);

// // 3. Get room types (PUBLIC) - No auth required
// router.get('/:hostelId/rooms', getRoomTypes);

// // ============================================
// // Protected routes (auth required)
// // ============================================

// // 4. Get owner's hostels (OWNER only)
// router.get('/owner/hostels', auth, authorize('owner'), getOwnerHostels);

// // 5. Create hostel (OWNER only)
// router.post('/', auth, authorize('owner'), uploadMultiple('photos', 10), createHostel);

// // 6. Update hostel (OWNER/ADMIN)
// router.put('/:id', auth, authorize('owner', 'admin'), updateHostel);

// // 7. Add room type (OWNER only)
// router.post('/:hostelId/rooms', auth, authorize('owner'), addRoomType);

// module.exports = router;




const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');
const {
    createHostel,
    getHostels,
    getHostel,
    updateHostel,
    getOwnerHostels,
    addRoomType,
    getRoomTypes,  // ← Make sure this is imported
    getHostelItinerary
} = require('../controllers/hostelController');

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

// 1. Get all hostels (PUBLIC)
router.get('/', getHostels);

// 2. Get single hostel (PUBLIC)
router.get('/:id', getHostel);

// 3. Get room types (PUBLIC) - No auth required
router.get('/:hostelId/rooms', getRoomTypes);

// 3b. Get AI-generated nearby attractions + itinerary (PUBLIC)
router.get('/:id/itinerary', getHostelItinerary);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

// 4. Get owner's hostels (OWNER only)
router.get('/owner/hostels', auth, authorize('owner'), getOwnerHostels);

// 5. Create hostel (OWNER only)
router.post('/', auth, authorize('owner'), uploadMultiple('photos', 10), createHostel);

// 6. Update hostel (OWNER/ADMIN)
router.put('/:id', auth, authorize('owner', 'admin'), updateHostel);

// 7. Add room type (OWNER only)
router.post('/:hostelId/rooms', auth, authorize('owner'), addRoomType);

module.exports = router;