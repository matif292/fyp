const User = require('../models/User');
const OwnerDetail = require('../models/OwnerDetail');
const Hostel = require('../models/Hostel');
const Review = require('../models/Review');
const PlatformSettings = require('../models/PlatformSettings');
const pool = require('../config/database');
const { sendEmail } = require('../utils/email');

// @desc    Get platform settings (Admin)
// @route   GET /api/admin/settings
// @access  Private (Admin only)
exports.getSettings = async (req, res) => {
    try {
        const settings = await PlatformSettings.get();
        res.json({ success: true, data: settings });
    } catch (error) {
        console.error('❌ Get settings error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update platform settings (Admin)
// @route   PUT /api/admin/settings
// @access  Private (Admin only)
exports.updateSettings = async (req, res) => {
    try {
        const { maintenance_mode, auto_approve_owners, announcement_banner } = req.body;
        const settings = await PlatformSettings.update({ maintenance_mode, auto_approve_owners, announcement_banner });
        res.json({ success: true, message: 'Settings updated', data: settings });
    } catch (error) {
        console.error('❌ Update settings error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get platform-wide review sentiment overview (Admin)
// @route   GET /api/admin/sentiment-overview
// @access  Private (Admin only)
exports.getSentimentOverview = async (req, res) => {
    try {
        const overview = await Review.getSentimentOverview();
        res.json({ success: true, data: overview });
    } catch (error) {
        console.error('❌ Get sentiment overview error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all hostels with listing status (Admin)
// @route   GET /api/admin/hostels
// @access  Private (Admin only)
exports.getAllHostels = async (req, res) => {
    try {
        const [hostels] = await pool.execute(`
            SELECT h.id, h.name, h.city, h.is_active, h.created_at,
                   u.full_name AS owner_name, u.email AS owner_email
            FROM hostels h
            LEFT JOIN users u ON h.owner_id = u.id
            ORDER BY h.created_at DESC
        `);
        res.json({ success: true, data: hostels });
    } catch (error) {
        console.error('❌ Get all hostels error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Approve/unapprove a hostel listing (Admin)
// @route   PUT /api/admin/hostels/:hostelId/toggle-status
// @access  Private (Admin only)
exports.toggleHostelStatus = async (req, res) => {
    try {
        const { hostelId } = req.params;
        const hostel = await Hostel.findById(hostelId);
        if (!hostel) {
            return res.status(404).json({ success: false, message: 'Hostel not found' });
        }
        const nextStatus = !hostel.is_active;
        await Hostel.update(hostelId, { is_active: nextStatus });
        res.json({
            success: true,
            message: nextStatus ? 'Hostel approved and listed' : 'Hostel unlisted',
            data: { id: Number(hostelId), is_active: nextStatus }
        });
    } catch (error) {
        console.error('❌ Toggle hostel status error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get dashboard stats (Admin)
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getStats = async (req, res) => {
    try {
        console.log('📊 Fetching admin stats...');
        console.log('User:', req.user); // Debug log

        // Check if user is admin
        if (req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const queries = {
            totalUsers: 'SELECT COUNT(*) as count FROM users',
            totalOwners: 'SELECT COUNT(*) as count FROM users WHERE role = "owner"',
            totalTravelers: 'SELECT COUNT(*) as count FROM users WHERE role = "traveler"',
            pendingApprovals: 'SELECT COUNT(*) as count FROM owner_details WHERE is_approved = FALSE',
            totalHostels: 'SELECT COUNT(*) as count FROM hostels',
            totalBookings: 'SELECT COUNT(*) as count FROM bookings',
            totalRevenue: 'SELECT COALESCE(SUM(total_price), 0) as total FROM bookings WHERE payment_status = "paid"'
        };

        const results = {};
        for (const [key, query] of Object.entries(queries)) {
            try {
                const [rows] = await pool.execute(query);
                results[key] = rows[0].count || 0;
            } catch (error) {
                console.error(`Error fetching ${key}:`, error.message);
                results[key] = 0;
            }
        }

        // Get recent bookings with proper joins
        let recentBookings = [];
        try {
            const recentBookingsQuery = `
                SELECT b.*, u.full_name as traveler_name, h.name as hostel_name
                FROM bookings b
                LEFT JOIN users u ON b.traveler_id = u.id
                LEFT JOIN hostels h ON b.hostel_id = h.id
                ORDER BY b.created_at DESC
                LIMIT 5
            `;
            const [rows] = await pool.execute(recentBookingsQuery);
            recentBookings = rows;
        } catch (error) {
            console.error('Error fetching recent bookings:', error.message);
            recentBookings = [];
        }

        // Get recent owner registrations
        let recentOwners = [];
        try {
            const recentOwnersQuery = `
                SELECT u.id, u.full_name, u.email, u.created_at, od.is_approved
                FROM users u
                JOIN owner_details od ON u.id = od.user_id
                ORDER BY u.created_at DESC
                LIMIT 5
            `;
            const [rows] = await pool.execute(recentOwnersQuery);
            recentOwners = rows;
        } catch (error) {
            console.error('Error fetching recent owners:', error.message);
            recentOwners = [];
        }

        res.json({
            success: true,
            data: {
                stats: {
                    totalUsers: results.totalUsers,
                    totalOwners: results.totalOwners,
                    totalTravelers: results.totalTravelers,
                    pendingApprovals: results.pendingApprovals,
                    totalHostels: results.totalHostels,
                    totalBookings: results.totalBookings,
                    totalRevenue: results.totalRevenue
                },
                recentBookings,
                recentOwners,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Get stats error:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get all pending owner approvals
// @route   GET /api/admin/pending-approvals
// @access  Private (Admin only)
exports.getPendingApprovals = async (req, res) => {
    try {
        if (req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const query = `
            SELECT od.*, u.full_name, u.email, u.phone, u.created_at
            FROM owner_details od
            JOIN users u ON od.user_id = u.id
            WHERE od.is_approved = FALSE AND u.is_active = TRUE
            ORDER BY od.created_at ASC
        `;
        const [rows] = await pool.execute(query);

        res.json({
            success: true,
            count: rows.length,
            data: rows
        });

    } catch (error) {
        console.error('Get pending approvals error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Approve owner registration
// @route   PUT /api/admin/approve-owner/:userId
// @access  Private (Admin only)
exports.approveOwner = async (req, res) => {
    try {
        if (req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const { userId } = req.params;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if owner details exist
        const ownerDetails = await OwnerDetail.findByUserId(userId);
        if (!ownerDetails) {
            return res.status(404).json({
                success: false,
                message: 'Owner details not found'
            });
        }

        if (ownerDetails.is_approved) {
            return res.status(400).json({
                success: false,
                message: 'Owner already approved'
            });
        }

        // Approve owner
        await OwnerDetail.approve(userId);

        // Send approval email (optional)
        try {
            await sendEmail({
                to: user.email,
                subject: '🎉 Your Tripzo Hostel Owner Account is Approved!',
                html: `
                    <h2>Congratulations ${user.full_name}!</h2>
                    <p>Your hostel owner account has been approved by our admin team.</p>
                    <p>You can now login and start managing your property on Tripzo.</p>
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/owner/dashboard">Go to Dashboard</a>
                `
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError.message);
        }

        res.json({
            success: true,
            message: 'Owner approved successfully'
        });

    } catch (error) {
        console.error('Approve owner error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Reject owner registration
// @route   PUT /api/admin/reject-owner/:userId
// @access  Private (Admin only)
exports.rejectOwner = async (req, res) => {
    try {
        if (req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const { userId } = req.params;
        const { reason } = req.body;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if owner details exist
        const ownerDetails = await OwnerDetail.findByUserId(userId);
        if (!ownerDetails) {
            return res.status(404).json({
                success: false,
                message: 'Owner details not found'
            });
        }

        if (ownerDetails.is_approved) {
            return res.status(400).json({
                success: false,
                message: 'Owner is already approved'
            });
        }

        // Reject owner
        await OwnerDetail.reject(userId, reason || 'Application did not meet requirements');

        // Send rejection email
        try {
            await sendEmail({
                to: user.email,
                subject: 'Tripzo Owner Application Update',
                html: `
                    <h2>Application Status Update</h2>
                    <p>Dear ${user.full_name},</p>
                    <p>We regret to inform you that your owner application has been rejected.</p>
                    <p><strong>Reason:</strong> ${reason || 'Application did not meet requirements'}</p>
                    <p>You can reapply with updated information.</p>
                `
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError.message);
        }

        res.json({
            success: true,
            message: 'Owner rejected successfully'
        });

    } catch (error) {
        console.error('Reject owner error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res) => {
    try {
        if (req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const query = `
            SELECT id, full_name, email, phone, role, is_verified, is_active, email_verified, created_at
            FROM users
            ORDER BY created_at DESC
        `;
        const [rows] = await pool.execute(query);

        res.json({
            success: true,
            count: rows.length,
            data: rows
        });

    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Toggle user status (activate/deactivate)
// @route   PUT /api/admin/users/:userId/toggle-status
// @access  Private (Admin only)
exports.toggleUserStatus = async (req, res) => {
    try {
        if (req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const { userId } = req.params;
        const { is_active } = req.body;

        if (typeof is_active !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'is_active must be a boolean'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await User.update(userId, { is_active });

        res.json({
            success: true,
            message: `User ${is_active ? 'activated' : 'deactivated'} successfully`
        });

    } catch (error) {
        console.error('Toggle user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};