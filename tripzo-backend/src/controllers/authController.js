const User = require('../models/User');
const OwnerDetail = require('../models/OwnerDetail');
const PlatformSettings = require('../models/PlatformSettings');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/email');

// Generate JWT Token
const generateToken = (id, role) => {
    return jwt.sign(
        { id, role }, 
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// Generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register Traveler
// @route   POST /api/auth/register
// @access  Public
exports.registerTraveler = async (req, res) => {
    try {
        const { full_name, email, phone, password, date_of_birth, preferred_language } = req.body;

        // Check if user exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create user
        const userId = await User.create({
            full_name,
            email,
            phone,
            password,
            role: 'traveler',
            date_of_birth,
            preferred_language
        });

        // Generate OTP
        const otp = generateOTP();
        await User.saveOTP(email, otp);

        // Send OTP email
        await sendEmail({
            to: email,
            subject: 'Verify Your Tripzo Account',
            html: `
                <h2>Welcome to Tripzo!</h2>
                <p>Your verification code is: <strong>${otp}</strong></p>
                <p>This code will expire in 10 minutes.</p>
            `
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please verify your email with OTP.',
            userId
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

// @desc    Register Hostel Owner
// @route   POST /api/auth/register-owner
// @access  Public
exports.registerOwner = async (req, res) => {
    try {
        const {
            full_name,
            email,
            phone,
            password,
            date_of_birth,
            cnic_number,
            business_reg_number,
            bank_name,
            account_title,
            account_number,
            iban
        } = req.body;

        // Check if user exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Check if files are uploaded
        if (!req.files || !req.files.cnic_front || !req.files.cnic_back) {
            return res.status(400).json({
                success: false,
                message: 'CNIC front and back photos are required'
            });
        }

        // Create user
        const userId = await User.create({
            full_name,
            email,
            phone,
            password,
            role: 'owner',
            date_of_birth
        });

        // Create owner details
        await OwnerDetail.create({
            user_id: userId,
            cnic_number,
            cnic_front: req.files.cnic_front[0].path,
            cnic_back: req.files.cnic_back[0].path,
            business_reg_number,
            business_license: req.files.business_license ? req.files.business_license[0].path : null,
            bank_name,
            account_title,
            account_number,
            iban,
            bank_letter: req.files.bank_letter ? req.files.bank_letter[0].path : null
        });

        // Generate OTP
        const otp = generateOTP();
        await User.saveOTP(email, otp);

        // Auto-approve if the platform has this enabled (admin setting)
        const settings = await PlatformSettings.get();
        let autoApproved = false;
        if (settings.auto_approve_owners) {
            await OwnerDetail.approve(userId);
            autoApproved = true;
        }

        // Send OTP email
        await sendEmail({
            to: email,
            subject: 'Verify Your Tripzo Owner Account',
            html: `
                <h2>Welcome to Tripzo as a Hostel Owner!</h2>
                <p>Your verification code is: <strong>${otp}</strong></p>
                <p>This code will expire in 10 minutes.</p>
                <p>${autoApproved ? 'Your account has been auto-approved — you can start listing right away!' : 'Your application will be reviewed by our admin team.'}</p>
            `
        });

        res.status(201).json({
            success: true,
            message: autoApproved
                ? 'Owner registration successful and auto-approved! Please verify your email with OTP.'
                : 'Owner registration successful. Please verify your email with OTP.',
            userId,
            pendingApproval: !autoApproved
        });

    } catch (error) {
        console.error('Owner registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during owner registration'
        });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.verifyOTP(email, otp);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Verify email
        await User.verifyEmail(email);

        // Generate token
        const token = generateToken(user.id, user.role);

        res.json({
            success: true,
            message: 'Email verified successfully',
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                is_verified: user.is_verified
            }
        });

    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during OTP verification'
        });
    }
};

// @desc    Login
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user exists
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if email is verified
        if (!user.email_verified) {
            return res.status(401).json({
                success: false,
                message: 'Please verify your email first'
            });
        }

        // Check password
        const isMatch = await User.comparePassword(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if owner is approved (if role is owner)
        if (user.role === 'owner') {
            const ownerDetails = await OwnerDetail.findByUserId(user.id);
            if (ownerDetails && !ownerDetails.is_approved) {
                return res.status(403).json({
                    success: false,
                    message: 'Your owner account is pending admin approval',
                    pendingApproval: true
                });
            }
        }

        // Generate token
        const token = generateToken(user.id, user.role);

        // Remove sensitive data
        delete user.password_hash;
        delete user.otp_code;
        delete user.otp_expires;

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        delete user.password_hash;
        delete user.otp_code;
        delete user.otp_expires;

        res.json({
            success: true,
            user
        });

    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.email_verified) {
            return res.status(400).json({
                success: false,
                message: 'Email already verified'
            });
        }

        const otp = generateOTP();
        await User.saveOTP(email, otp);

        await sendEmail({
            to: email,
            subject: 'Resend OTP - Tripzo',
            html: `
                <h2>Your New OTP</h2>
                <p>Your verification code is: <strong>${otp}</strong></p>
                <p>This code will expire in 10 minutes.</p>
            `
        });

        res.json({
            success: true,
            message: 'OTP sent successfully'
        });

    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};