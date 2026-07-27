const app = require('./src/app');
const dotenv = require('dotenv');
const pool = require('./src/config/database');
const bcrypt = require('bcryptjs');

dotenv.config();

const PORT = process.env.PORT || 5000;

// Initialize admin user
const initAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@tripzo.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
        
        console.log('🔧 Checking for admin user...');
        
        // Check if admin exists
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [adminEmail]);
        
        if (rows.length === 0) {
            console.log('👤 Creating admin user...');
            
            // Create admin user
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);
            
            await pool.execute(
                `INSERT INTO users 
                (full_name, email, password_hash, role, is_verified, email_verified) 
                VALUES (?, ?, ?, 'admin', TRUE, TRUE)`,
                ['Admin', adminEmail, hashedPassword]
            );
            
            console.log('✅ Admin user created successfully!');
            console.log(`📧 Email: ${adminEmail}`);
            console.log(`🔑 Password: ${adminPassword}`);
            console.log('⚠️  Please change these credentials after first login!');
        } else {
            console.log('✅ Admin user already exists');
        }
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        console.error('Make sure the database is running and tables are created');
        process.exit(1);
    }
};

// Test database connection
const testConnection = async () => {
    try {
        const [rows] = await pool.execute('SELECT 1');
        console.log('✅ Database connected successfully');
        console.log(`📊 Database: ${process.env.DB_NAME || 'tripzo_db'}`);
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('Please check:');
        console.error('1. MySQL is running');
        console.error('2. Database credentials in .env file are correct');
        console.error('3. Database exists (run the SQL schema)');
        return false;
    }
};

// Start server
const startServer = async () => {
    console.log('🚀 Starting Tripzo Backend...');
    console.log('=' .repeat(50));
    
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
        console.error('❌ Cannot start server without database connection');
        process.exit(1);
    }
    
    // Initialize admin
    await initAdmin();
    
    console.log('=' .repeat(50));
    
    app.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
        console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
        console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth`);
        console.log(`👑 Admin login: POST http://localhost:${PORT}/api/auth/login`);
        console.log(`📊 Admin dashboard: GET http://localhost:${PORT}/api/admin/stats`);
        console.log('\n📝 Available endpoints:');
        console.log('  POST /api/auth/register - Register traveler');
        console.log('  POST /api/auth/register-owner - Register owner');
        console.log('  POST /api/auth/verify-otp - Verify email');
        console.log('  POST /api/auth/login - Login');
        console.log('  GET /api/auth/me - Get current user');
        console.log('\n🔑 Default Admin Credentials:');
        console.log(`  Email: ${process.env.ADMIN_EMAIL || 'admin@tripzo.com'}`);
        console.log(`  Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
        console.log('\n' + '=' .repeat(50));
        console.log('✨ Tripzo Backend is ready to use!');
    });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
});

startServer();