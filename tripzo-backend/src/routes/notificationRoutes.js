const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
    getOwnerNotifications,
    getUnreadCount,
    markNotificationRead,
    markAllRead
} = require('../controllers/notificationController');

router.use(auth, authorize('owner'));

router.get('/', getOwnerNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/read-all', markAllRead);
router.put('/:id/read', markNotificationRead);

module.exports = router;
