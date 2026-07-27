const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tripzo_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Promisify for async/await
const promisePool = pool.promise();

// Test connection function
const testConnection = async () => {
    try {
        const [rows] = await promisePool.execute('SELECT 1');
        console.log('✅ Database connected successfully');
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('Please check your database credentials in .env file');
        return false;
    }
};

module.exports = promisePool;
module.exports.testConnection = testConnection;