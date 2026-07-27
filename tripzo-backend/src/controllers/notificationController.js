const RoomNotification = require('../models/RoomNotification');

// @desc    Get owner's notifications
// @route   GET /api/notifications
// @access  Private (Owner only)
exports.getOwnerNotifications = async (req, res) => {
    try {
        const unreadOnly = req.query.unread === 'true';
        const notifications = await RoomNotification.findByOwner(req.userId, { unreadOnly });
        const unreadCount = await RoomNotification.getUnreadCount(req.userId);
        res.json({ success: true, data: notifications, unreadCount });
    } catch (error) {
        console.error('❌ Get owner notifications error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private (Owner only)
exports.getUnreadCount = async (req, res) => {
    try {
        const count = await RoomNotification.getUnreadCount(req.userId);
        res.json({ success: true, data: { count } });
    } catch (error) {
        console.error('❌ Get unread count error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private (Owner only)
exports.markNotificationRead = async (req, res) => {
    try {
        const updated = await RoomNotification.markRead(req.params.id, req.userId);
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        console.error('❌ Mark notification read error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private (Owner only)
exports.markAllRead = async (req, res) => {
    try {
        const count = await RoomNotification.markAllRead(req.userId);
        res.json({ success: true, message: `${count} notification(s) marked as read` });
    } catch (error) {
        console.error('❌ Mark all read error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
