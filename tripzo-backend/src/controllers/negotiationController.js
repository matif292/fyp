const Negotiation = require('../models/Negotiation');
const RoomType = require('../models/RoomType');
const Hostel = require('../models/Hostel');
const Booking = require('../models/Booking');
const { evaluateOffer } = require('../services/negotiationEngine');

const nightsBetween = (checkIn, checkOut) => {
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
};

const createBookingFromNegotiation = async (negotiation, pricePerNight) => {
    const nights = nightsBetween(negotiation.check_in_date, negotiation.check_out_date);
    const total_price = nights * Number(pricePerNight) * (negotiation.total_guests || 1);

    const bookingId = await Booking.create({
        booking_number: Booking.generateBookingNumber(),
        traveler_id: negotiation.user_id,
        hostel_id: negotiation.hostel_id,
        room_type_id: negotiation.room_type_id,
        check_in_date: negotiation.check_in_date,
        check_out_date: negotiation.check_out_date,
        total_guests: negotiation.total_guests || 1,
        total_price,
        special_requests: 'Booked via negotiated price',
        payment_method: 'pending',
    });
    return bookingId;
};

// @desc    Send a price offer for a room type
// @route   POST /api/negotiations
// @access  Private (Traveler only)
exports.sendNegotiation = async (req, res) => {
    try {
        const { hostel_id, room_type_id, offered_price, check_in_date, check_out_date, total_guests } = req.body;

        if (!hostel_id || !room_type_id || !offered_price || !check_in_date || !check_out_date) {
            return res.status(400).json({ success: false, message: 'hostel_id, room_type_id, offered_price, check_in_date and check_out_date are required' });
        }

        const nights = nightsBetween(check_in_date, check_out_date);
        if (nights <= 0) {
            return res.status(400).json({ success: false, message: 'Check-out date must be after check-in date' });
        }

        const roomType = await RoomType.findById(room_type_id);
        if (!roomType || roomType.hostel_id !== parseInt(hostel_id)) {
            return res.status(404).json({ success: false, message: 'Room type not found for this hostel' });
        }

        const alreadyPending = await Negotiation.hasPending(req.userId, room_type_id);
        if (alreadyPending) {
            return res.status(400).json({ success: false, message: 'You already have a pending offer for this room type' });
        }

        const availableCount = await Booking.checkAvailability(hostel_id, room_type_id, check_in_date, check_out_date);
        if (availableCount >= roomType.total_rooms) {
            return res.status(400).json({ success: false, message: 'No rooms available for the selected dates' });
        }

        const systemPrice = Number(roomType.price_per_night);
        const rules = await Negotiation.getRules(hostel_id);
        const evaluation = evaluateOffer(systemPrice, Number(offered_price), rules);

        const negotiationId = await Negotiation.create({
            user_id: req.userId,
            hostel_id,
            room_type_id,
            offered_price,
            system_price: systemPrice,
            status: evaluation.status,
            counter_offer: evaluation.counterOffer,
            check_in_date,
            check_out_date,
            total_guests: total_guests || 1,
            reason: evaluation.reason || null,
        });

        let negotiation = await Negotiation.findById(negotiationId);

        if (evaluation.status === 'accepted') {
            const bookingId = await createBookingFromNegotiation(negotiation, offered_price);
            negotiation = await Negotiation.updateStatus(negotiationId, 'accepted', { resulting_booking_id: bookingId });
        }

        res.status(201).json({
            success: true,
            message:
                evaluation.status === 'accepted' ? 'Your offer was accepted! Booking confirmed.' :
                evaluation.status === 'counter' ? `The owner countered with Rs. ${evaluation.counterOffer}/night.` :
                evaluation.status === 'rejected' ? (evaluation.reason || 'Your offer was not accepted.') :
                'Your offer was sent to the owner for review.',
            data: negotiation,
        });
    } catch (error) {
        console.error('❌ Send negotiation error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

// @desc    Get my negotiations (Traveler)
// @route   GET /api/negotiations/my
// @access  Private (Traveler only)
exports.getMyNegotiations = async (req, res) => {
    try {
        const negotiations = await Negotiation.findByUser(req.userId);
        res.json({ success: true, count: negotiations.length, data: negotiations });
    } catch (error) {
        console.error('❌ Get my negotiations error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Accept the owner's counter-offer (Traveler)
// @route   POST /api/negotiations/:id/accept-counter
// @access  Private (Traveler only)
exports.acceptCounter = async (req, res) => {
    try {
        const { id } = req.params;
        const negotiation = await Negotiation.findById(id);

        if (!negotiation) return res.status(404).json({ success: false, message: 'Negotiation not found' });
        if (negotiation.user_id !== req.userId) return res.status(403).json({ success: false, message: 'Not your negotiation' });
        if (negotiation.status !== 'counter') return res.status(400).json({ success: false, message: 'This negotiation has no active counter-offer' });
        if (negotiation.expires_at && new Date(negotiation.expires_at) < new Date()) {
            await Negotiation.updateStatus(id, 'expired');
            return res.status(400).json({ success: false, message: 'This offer has expired' });
        }

        const availableCount = await Booking.checkAvailability(negotiation.hostel_id, negotiation.room_type_id, negotiation.check_in_date, negotiation.check_out_date);
        const roomType = await RoomType.findById(negotiation.room_type_id);
        if (availableCount >= roomType.total_rooms) {
            return res.status(400).json({ success: false, message: 'Sorry, this room is no longer available for those dates' });
        }

        const bookingId = await createBookingFromNegotiation(negotiation, negotiation.counter_offer);
        const updated = await Negotiation.updateStatus(id, 'counter_accepted', { resulting_booking_id: bookingId });

        res.json({ success: true, message: 'Counter-offer accepted! Booking confirmed.', data: updated });
    } catch (error) {
        console.error('❌ Accept counter error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get negotiations for the owner's hostels
// @route   GET /api/negotiations/hostel-owner
// @access  Private (Owner only)
exports.getOwnerNegotiations = async (req, res) => {
    try {
        const negotiations = await Negotiation.findByHostelOwner(req.userId);
        res.json({ success: true, count: negotiations.length, data: negotiations });
    } catch (error) {
        console.error('❌ Get owner negotiations error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Manually respond to a negotiation (Owner)
// @route   PUT /api/negotiations/:id/respond
// @access  Private (Owner only)
exports.respondToNegotiation = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, counter_offer } = req.body; // action: 'accept' | 'reject' | 'counter'

        const negotiation = await Negotiation.findById(id);
        if (!negotiation) return res.status(404).json({ success: false, message: 'Negotiation not found' });

        const hostel = await Hostel.findById(negotiation.hostel_id);
        if (hostel.owner_id !== req.userId) return res.status(403).json({ success: false, message: 'Not your hostel' });

        if (!['pending', 'counter'].includes(negotiation.status)) {
            return res.status(400).json({ success: false, message: 'This negotiation has already been resolved' });
        }

        if (action === 'accept') {
            const bookingId = await createBookingFromNegotiation(negotiation, negotiation.offered_price);
            const updated = await Negotiation.updateStatus(id, 'accepted', { resulting_booking_id: bookingId });
            return res.json({ success: true, message: 'Offer accepted and booking created.', data: updated });
        }

        if (action === 'reject') {
            const updated = await Negotiation.updateStatus(id, 'rejected', { reason: 'Rejected by owner' });
            return res.json({ success: true, message: 'Offer rejected.', data: updated });
        }

        if (action === 'counter') {
            if (!counter_offer || counter_offer <= 0) {
                return res.status(400).json({ success: false, message: 'counter_offer is required' });
            }
            const updated = await Negotiation.updateStatus(id, 'counter', { counter_offer });
            return res.json({ success: true, message: 'Counter-offer sent.', data: updated });
        }

        res.status(400).json({ success: false, message: "action must be 'accept', 'reject', or 'counter'" });
    } catch (error) {
        console.error('❌ Respond to negotiation error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get a hostel's negotiation rules
// @route   GET /api/negotiations/hostel/:hostelId/rules
// @access  Private (Owner only)
exports.getRules = async (req, res) => {
    try {
        const { hostelId } = req.params;
        const hostel = await Hostel.findById(hostelId);
        if (!hostel) return res.status(404).json({ success: false, message: 'Hostel not found' });
        if (hostel.owner_id !== req.userId) return res.status(403).json({ success: false, message: 'Not your hostel' });

        const rules = await Negotiation.getRules(hostelId);
        res.json({ success: true, data: rules });
    } catch (error) {
        console.error('❌ Get negotiation rules error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update a hostel's negotiation rules
// @route   PUT /api/negotiations/hostel/:hostelId/rules
// @access  Private (Owner only)
exports.updateRules = async (req, res) => {
    try {
        const { hostelId } = req.params;
        const hostel = await Hostel.findById(hostelId);
        if (!hostel) return res.status(404).json({ success: false, message: 'Hostel not found' });
        if (hostel.owner_id !== req.userId) return res.status(403).json({ success: false, message: 'Not your hostel' });

        const existing = await Negotiation.getRules(hostelId);
        const rules = await Negotiation.upsertRules(hostelId, { ...existing, ...req.body });
        res.json({ success: true, message: 'Negotiation rules updated', data: rules });
    } catch (error) {
        console.error('❌ Update negotiation rules error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
