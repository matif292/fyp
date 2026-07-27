const PlatformSettings = require('../models/PlatformSettings');

// @desc    Get public-safe platform settings (banner + maintenance flag only)
// @route   GET /api/settings/public
// @access  Public
exports.getPublicSettings = async (req, res) => {
    try {
        const settings = await PlatformSettings.get();
        res.json({
            success: true,
            data: {
                maintenance_mode: !!settings.maintenance_mode,
                announcement_banner: settings.announcement_banner || null
            }
        });
    } catch (error) {
        console.error('❌ Get public settings error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
