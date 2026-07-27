// const express = require('express');
// const router = express.Router();
// const { uploadMultiple, uploadSingle } = require('../middleware/upload');
// const { auth } = require('../middleware/auth');
// const {
//     registerTraveler,
//     registerOwner,
//     verifyOTP,
//     login,
//     getMe,
//     resendOTP
// } = require('../controllers/authController');

// // Public routes
// router.post('/register', registerTraveler);
// router.post('/register-owner', uploadMultiple('cnic_front', 1), uploadMultiple('cnic_back', 1), uploadMultiple('business_license', 1), uploadMultiple('bank_letter', 1), registerOwner);
// router.post('/verify-otp', verifyOTP);
// router.post('/login', login);
// router.post('/resend-otp', resendOTP);

// // Protected routes
// router.get('/me', auth, getMe);

// module.exports = router;


const express = require('express');
const router = express.Router();
const { uploadOwnerFields } = require('../middleware/upload');
const { auth } = require('../middleware/auth');
const {
    registerTraveler,
    registerOwner,
    verifyOTP,
    login,
    getMe,
    resendOTP
} = require('../controllers/authController');

// Public routes
router.post('/register', registerTraveler);
router.post('/register-owner', uploadOwnerFields, registerOwner);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/resend-otp', resendOTP);

// Protected routes
router.get('/me', auth, getMe);

module.exports = router;