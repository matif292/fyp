const Booking = require('../models/Booking');
const Hostel = require('../models/Hostel');
const RoomType = require('../models/RoomType');
const User = require('../models/User');
const RoomNotification = require('../models/RoomNotification');
const PlatformSettings = require('../models/PlatformSettings');
const pool = require('../config/database');
const { notifyWaitingList } = require('../services/waitingListNotifier');

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private (Traveler only)
exports.createBooking = async (req, res) => {
    try {
        console.log('========================================');
        console.log('📝 CREATE BOOKING');
        console.log('========================================');
        console.log('User ID:', req.userId);
        console.log('Request Body:', req.body);

        const settings = await PlatformSettings.get();
        if (settings.maintenance_mode) {
            return res.status(503).json({
                success: false,
                message: 'Tripzo is temporarily paused for maintenance. Please try booking again shortly.'
            });
        }

        const {
            hostel_id,
            room_type_id,
            check_in_date,
            check_out_date,
            total_guests,
            special_requests,
            payment_method
        } = req.body;

        // Validate required fields
        if (!hostel_id || !room_type_id || !check_in_date || !check_out_date) {
            return res.status(400).json({
                success: false,
                message: 'Please provide hostel_id, room_type_id, check_in_date, and check_out_date'
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

        // Check if room type exists
        const roomType = await RoomType.findById(room_type_id);
        if (!roomType) {
            return res.status(404).json({
                success: false,
                message: 'Room type not found'
            });
        }

        // Check if room type belongs to hostel
        if (roomType.hostel_id !== parseInt(hostel_id)) {
            return res.status(400).json({
                success: false,
                message: 'Room type does not belong to this hostel'
            });
        }

        // Check availability
        const bookedCount = await Booking.checkAvailability(
            hostel_id, 
            room_type_id, 
            check_in_date, 
            check_out_date
        );

        if (bookedCount >= roomType.total_rooms) {
            return res.status(400).json({
                success: false,
                message: 'No rooms available for the selected dates'
            });
        }

        // Calculate total price
        const checkIn = new Date(check_in_date);
        const checkOut = new Date(check_out_date);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        
        if (nights <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Check-out date must be after check-in date'
            });
        }

        const total_price = nights * parseFloat(roomType.price_per_night) * (total_guests || 1);

        // Generate booking number
        const booking_number = Booking.generateBookingNumber();

        // Create booking
        const bookingId = await Booking.create({
            booking_number,
            traveler_id: req.userId,
            hostel_id: parseInt(hostel_id),
            room_type_id: parseInt(room_type_id),
            check_in_date,
            check_out_date,
            total_guests: total_guests || 1,
            total_price,
            special_requests: special_requests || null,
            payment_method: payment_method || 'pending'
        });

        console.log('✅ Booking created with ID:', bookingId);

        // Get the created booking
        const newBooking = await Booking.findById(bookingId);

        const traveler = await User.findById(req.userId);
        RoomNotification.create({
            owner_id: hostel.owner_id,
            hostel_id: hostel.id,
            booking_id: bookingId,
            type: 'booking',
            message: `New booking from ${traveler?.full_name || 'a traveler'} for ${hostel.name} (${check_in_date} → ${check_out_date})`
        }).catch((err) => console.error('Owner notification failed:', err.message));

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: newBooking
        });

    } catch (error) {
        console.error('❌ Create booking error:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get my bookings (Traveler)
// @route   GET /api/bookings/my-bookings
// @access  Private (Traveler only)
exports.getMyBookings = async (req, res) => {
    try {
        console.log('📝 Fetching bookings for user:', req.userId);
        
        const bookings = await Booking.findByTraveler(req.userId);

        res.json({
            success: true,
            count: bookings.length,
            data: bookings
        });

    } catch (error) {
        console.error('❌ Get my bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get hostel bookings (Owner)
// @route   GET /api/bookings/hostel/:hostelId
// @access  Private (Owner only)
exports.getHostelBookings = async (req, res) => {
    try {
        const { hostelId } = req.params;
        console.log('📝 Fetching bookings for hostel:', hostelId);
        
        // Check if hostel exists and belongs to owner
        const hostel = await Hostel.findById(hostelId);
        if (!hostel) {
            return res.status(404).json({
                success: false,
                message: 'Hostel not found'
            });
        }

        if (hostel.owner_id !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to view bookings for this hostel'
            });
        }

        const bookings = await Booking.findByHostel(hostelId);

        res.json({
            success: true,
            count: bookings.length,
            data: bookings
        });

    } catch (error) {
        console.error('❌ Get hostel bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('📝 Fetching booking:', id);
        
        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user is authorized (traveler who booked or hostel owner or admin)
        if (booking.traveler_id !== req.userId) {
            const hostel = await Hostel.findById(booking.hostel_id);
            if (hostel.owner_id !== req.userId && req.userRole !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized to view this booking'
                });
            }
        }

        res.json({
            success: true,
            data: booking
        });

    } catch (error) {
        console.error('❌ Get booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Owner/Admin)
exports.updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        console.log('📝 Updating booking status:', { id, status });

        // Validate status
        const validStatuses = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        // Check if booking exists
        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user is authorized (hostel owner or admin)
        const hostel = await Hostel.findById(booking.hostel_id);
        if (hostel.owner_id !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to update this booking'
            });
        }

        // Update status
        await Booking.updateStatus(id, status);

        // Get updated booking
        const updatedBooking = await Booking.findById(id);

        if (status === 'cancelled') {
            notifyWaitingList(booking.hostel_id, booking.room_type_id, booking.check_in_date, booking.check_out_date)
                .catch((err) => console.error('Waiting list notify failed:', err.message));
        }

        res.json({
            success: true,
            message: 'Booking status updated successfully',
            data: updatedBooking
        });

    } catch (error) {
        console.error('❌ Update booking status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Cancel booking (Traveler)
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Traveler only)
exports.cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('📝 Cancelling booking:', id);

        // Check if booking exists
        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user is the traveler who booked
        if (booking.traveler_id !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to cancel this booking'
            });
        }

        // Check if booking can be cancelled (not already checked in)
        if (booking.status === 'checked_in') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel booking after check-in'
            });
        }

        // Cancel booking
        await Booking.cancel(id);

        // Get updated booking
        const cancelledBooking = await Booking.findById(id);

        notifyWaitingList(booking.hostel_id, booking.room_type_id, booking.check_in_date, booking.check_out_date)
            .catch((err) => console.error('Waiting list notify failed:', err.message));

        const cancelHostel = await Hostel.findById(booking.hostel_id);
        const traveler = await User.findById(req.userId);
        RoomNotification.create({
            owner_id: cancelHostel.owner_id,
            hostel_id: booking.hostel_id,
            booking_id: booking.id,
            type: 'cancellation',
            message: `${traveler?.full_name || 'A traveler'} cancelled booking #${booking.booking_number} for ${cancelHostel.name}`
        }).catch((err) => console.error('Owner notification failed:', err.message));

        res.json({
            success: true,
            message: 'Booking cancelled successfully',
            data: cancelledBooking
        });

    } catch (error) {
        console.error('❌ Cancel booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update payment status
// @route   PUT /api/bookings/:id/payment
// @access  Private (Owner/Admin)
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_status } = req.body;
        console.log('📝 Updating payment status:', { id, payment_status });

        // Validate payment status
        const validStatuses = ['pending', 'paid', 'refunded'];
        if (!validStatuses.includes(payment_status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid payment status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        // Check if booking exists
        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user is authorized (hostel owner or admin)
        const hostel = await Hostel.findById(booking.hostel_id);
        if (hostel.owner_id !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to update payment status'
            });
        }

        // Update payment status
        await Booking.updatePaymentStatus(id, payment_status);

        // Get updated booking
        const updatedBooking = await Booking.findById(id);

        res.json({
            success: true,
            message: 'Payment status updated successfully',
            data: updatedBooking
        });

    } catch (error) {
        console.error('❌ Update payment status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};