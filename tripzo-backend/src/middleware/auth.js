// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const auth = async (req, res, next) => {
//     try {
//         const token = req.header('Authorization')?.replace('Bearer ', '');
        
//         if (!token) {
//             return res.status(401).json({ 
//                 success: false, 
//                 message: 'No token, authorization denied' 
//             });
//         }

//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         const user = await User.findById(decoded.id);

//         if (!user) {
//             return res.status(401).json({ 
//                 success: false, 
//                 message: 'Token is not valid' 
//             });
//         }

//         if (!user.is_active) {
//             return res.status(401).json({ 
//                 success: false, 
//                 message: 'Account is deactivated' 
//             });
//         }

//         req.user = user;
//         req.userId = user.id;
//         req.userRole = user.role;
//         next();
//     } catch (error) {
//         console.error('Auth error:', error);
//         res.status(401).json({ 
//             success: false, 
//             message: 'Token is not valid' 
//         });
//     }
// };

// // Role-based authorization
// const authorize = (...roles) => {
//     return (req, res, next) => {
//         if (!req.user) {
//             return res.status(401).json({ 
//                 success: false, 
//                 message: 'Unauthorized' 
//             });
//         }

//         if (!roles.includes(req.user.role)) {
//             return res.status(403).json({ 
//                 success: false, 
//                 message: 'Access denied. Insufficient permissions.' 
//             });
//         }
//         next();
//     };
// };

// module.exports = { auth, authorize };



const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token, authorization denied'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Token is not valid'
            });
        }

        if (!user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        req.user = user;
        req.userId = user.id;
        req.userRole = user.role;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({
            success: false,
            message: 'Token is not valid'
        });
    }
};

// Role-based authorization
const authorize = (...roles) => {
    return (req, res, next) => {
        // If no user, return error
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized - Please login first'
            });
        }

        // Check if user role is allowed
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.',
                required_roles: roles,
                user_role: req.user.role
            });
        }
        next();
    };
};

module.exports = { auth, authorize };