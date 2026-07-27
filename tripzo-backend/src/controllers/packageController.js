const Package = require('../models/Package');
const Hostel = require('../models/Hostel');

// Create package (Owner)
exports.createPackage = async (req, res) => {
    try {
        const { hostel_id } = req.body;

        // Check if hostel belongs to owner
        const hostel = await Hostel.findById(hostel_id);
        if (!hostel || hostel.owner_id !== req.userId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const packageId = await Package.create(req.body);
        res.status(201).json({ success: true, data: { packageId } });
    } catch (error) {
        console.error('Create package error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get hostel packages
exports.getHostelPackages = async (req, res) => {
    try {
        const { hostelId } = req.params;
        const packages = await Package.getByHostel(hostelId);
        res.json({ success: true, data: packages });
    } catch (error) {
        console.error('Get hostel packages error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Book package
exports.bookPackage = async (req, res) => {
    try {
        const { packageId } = req.params;
        const { check_in_date, check_out_date } = req.body;

        const pkg = await Package.getById(packageId);
        if (!pkg) {
            return res.status(404).json({ success: false, message: 'Package not found' });
        }

        // Calculate total
        const nights = Math.ceil((new Date(check_out_date) - new Date(check_in_date)) / (1000 * 60 * 60 * 24));
        const totalPrice = nights * pkg.price;

        const bookingId = await Package.bookPackage(
            packageId,
            req.userId,
            check_in_date,
            check_out_date,
            totalPrice
        );

        res.status(201).json({ success: true, data: { bookingId } });
    } catch (error) {
        console.error('Book package error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get package bookings (Owner)
exports.getPackageBookings = async (req, res) => {
    try {
        const { hostelId } = req.params;
        const bookings = await Package.getBookings(hostelId);
        res.json({ success: true, data: bookings });
    } catch (error) {
        console.error('Get package bookings error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};