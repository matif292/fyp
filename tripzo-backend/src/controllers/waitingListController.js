const WaitingList = require('../models/WaitingList');
const RoomType = require('../models/RoomType');
const Hostel = require('../models/Hostel');
const Booking = require('../models/Booking');

// @desc    Join the waiting list for a hostel/room and dates
// @route   POST /api/waiting-list
// @access  Private (Traveler only)
exports.joinWaitingList = async (req, res) => {
    try {
        const { hostel_id, room_type_id, check_in_date, check_out_date, total_guests } = req.body;

        if (!hostel_id || !check_in_date || !check_out_date) {
            return res.status(400).json({ success: false, message: 'hostel_id, check_in_date and check_out_date are required' });
        }

        const hostel = await Hostel.findById(hostel_id);
        if (!hostel) return res.status(404).json({ success: false, message: 'Hostel not found' });

        if (room_type_id) {
            const roomType = await RoomType.findById(room_type_id);
            if (!roomType || roomType.hostel_id !== parseInt(hostel_id)) {
                return res.status(404).json({ success: false, message: 'Room type not found for this hostel' });
            }
            const bookedCount = await Booking.checkAvailability(hostel_id, room_type_id, check_in_date, check_out_date);
            if (bookedCount < roomType.total_rooms) {
                return res.status(400).json({ success: false, message: 'This room still has availability — book it directly instead of waitlisting.' });
            }
        }

        const already = await WaitingList.hasEntry(req.userId, hostel_id, room_type_id || null, check_in_date, check_out_date);
        if (already) {
            return res.status(400).json({ success: false, message: "You're already on the waiting list for these dates." });
        }

        const id = await WaitingList.create({
            user_id: req.userId, hostel_id, room_type_id, check_in_date, check_out_date, total_guests,
        });

        res.status(201).json({ success: true, message: "You're on the waiting list — we'll let you know if a room opens up.", data: { id } });
    } catch (error) {
        console.error('❌ Join waiting list error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get my waiting list entries
// @route   GET /api/waiting-list
// @access  Private (Traveler only)
exports.getMyWaitingList = async (req, res) => {
    try {
        const entries = await WaitingList.findByUser(req.userId);
        res.json({ success: true, count: entries.length, data: entries });
    } catch (error) {
        console.error('❌ Get waiting list error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Leave the waiting list
// @route   DELETE /api/waiting-list/:id
// @access  Private (Traveler only)
exports.removeFromWaitingList = async (req, res) => {
    try {
        const removed = await WaitingList.remove(req.params.id, req.userId);
        if (!removed) return res.status(404).json({ success: false, message: 'Waiting list entry not found' });
        res.json({ success: true, message: 'Removed from waiting list' });
    } catch (error) {
        console.error('❌ Remove from waiting list error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
