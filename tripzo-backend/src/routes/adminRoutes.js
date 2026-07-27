const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
    getPendingApprovals,
    approveOwner,
    rejectOwner,
    getAllUsers,
    toggleUserStatus,
    getStats,
    getSentimentOverview,
    getAllHostels,
    toggleHostelStatus,
    getSettings,
    updateSettings
} = require('../controllers/adminController');

// All routes require admin role
router.use(auth, authorize('admin'));

router.get('/pending-approvals', getPendingApprovals);
router.put('/approve-owner/:userId', approveOwner);
router.put('/reject-owner/:userId', rejectOwner);
router.get('/users', getAllUsers);
router.put('/users/:userId/toggle-status', toggleUserStatus);
router.get('/stats', getStats);
router.get('/sentiment-overview', getSentimentOverview);
router.get('/hostels', getAllHostels);
router.put('/hostels/:hostelId/toggle-status', toggleHostelStatus);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;