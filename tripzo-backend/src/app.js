// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const path = require('path');
// const multer = require('multer');

// dotenv.config();

// // Import routes
// const authRoutes = require('./routes/authRoutes');
// const adminRoutes = require('./routes/adminRoutes');
// const hostelRoutes = require('./routes/hostelRoutes');
// const bookingRoutes = require('./routes/bookingRoutes');
// const reviewRoutes = require('./routes/reviewRoutes');

// // NEW ROUTES (only import once)
// const chatRoutes = require('./routes/chatRoutes');
// const tripRoutes = require('./routes/tripRoutes');
// const packageRoutes = require('./routes/packageRoutes');
// const weatherRoutes = require('./routes/weatherRoutes');
// const budgetRoutes = require('./routes/budgetRoutes');

// const app = express();

// // CORS
// app.use(cors({
//     origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://localhost:5175'],
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization']
// }));

// // Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// // Routes - Register each route only ONCE
// app.use('/api/auth', authRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/hostels', hostelRoutes);
// app.use('/api/bookings', bookingRoutes);
// app.use('/api/reviews', reviewRoutes);
// app.use('/api/chat', chatRoutes);
// app.use('/api/trips', tripRoutes);  // Only ONCE
// app.use('/api/packages', packageRoutes);
// app.use('/api/weather', weatherRoutes);
// app.use('/api/budget', budgetRoutes);

// // Health check
// app.get('/api/health', (req, res) => {
//     res.json({
//         success: true,
//         message: 'Tripzo API is running',
//         timestamp: new Date().toISOString()
//     });
// });

// // Process expired trip plans every hour (if processExpiredPlans exists)
// setInterval(async () => {
//     try {
//         // Check if TripPlan model has processExpiredPlans method
//         const TripPlan = require('./models/TripPlan');
//         if (typeof TripPlan.processExpiredPlans === 'function') {
//             await TripPlan.processExpiredPlans();
//             console.log('✅ Processed expired trip plans');
//         }
//     } catch (error) {
//         console.error('Error processing expired plans:', error);
//     }
// }, 60 * 60 * 1000);

// // Error handling middleware
// app.use((err, req, res, next) => {
//     console.error('❌ Error:', err);
//     console.error('Stack:', err.stack);
    
//     if (err instanceof multer.MulterError) {
//         return res.status(400).json({
//             success: false,
//             message: err.message,
//             code: err.code
//         });
//     }
    
//     // Handle specific error types
//     if (err.type === 'entity.parse.failed') {
//         return res.status(400).json({
//             success: false,
//             message: 'Invalid JSON format'
//         });
//     }
    
//     // Handle SQL errors
//     if (err.code === 'ER_BAD_FIELD_ERROR') {
//         return res.status(400).json({
//             success: false,
//             message: 'Invalid field in request',
//             error: err.message
//         });
//     }
    
//     res.status(err.status || 500).json({
//         success: false,
//         message: err.message || 'Something went wrong!',
//         error: process.env.NODE_ENV === 'development' ? err.stack : undefined
//     });
// });

// // 404 handler
// app.use((req, res) => {
//     res.status(404).json({
//         success: false,
//         message: `Route '${req.originalUrl}' not found`
//     });
// });

// module.exports = app;


const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const hostelRoutes = require('./routes/hostelRoutes');  // ← Make sure this is correct
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const chatRoutes = require('./routes/chatRoutes');
const tripRoutes = require('./routes/tripRoutes');
const packageRoutes = require('./routes/packageRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const negotiationRoutes = require('./routes/negotiationRoutes');
const waitingListRoutes = require('./routes/waitingListRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const publicSettingsRoutes = require('./routes/publicSettingsRoutes');

const app = express();

// CORS
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure upload directories exist
const uploadDirs = ['uploads/hostel', 'uploads/cnic', 'uploads/bank', 'uploads/profile'];
uploadDirs.forEach(dir => {
    const fullPath = path.join(__dirname, '../', dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
    }
});

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hostels', hostelRoutes);  // ← Make sure this is registered
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/negotiations', negotiationRoutes);
app.use('/api/waiting-list', waitingListRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/settings', publicSettingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Tripzo API is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    console.error('Stack:', err.stack);
    
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            success: false,
            message: err.message,
            code: err.code
        });
    }
    
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route '${req.originalUrl}' not found`
    });
});

module.exports = app;