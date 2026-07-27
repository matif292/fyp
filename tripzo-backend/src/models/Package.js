const pool = require('../config/database');

class Package {
    // Create package
    static async create(data) {
        const {
            hostel_id,
            name,
            description,
            duration_days,
            price,
            includes,
            excludes
        } = data;

        const query = `
            INSERT INTO hotel_packages 
            (hostel_id, name, description, duration_days, price, includes, excludes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await pool.execute(query, [
            hostel_id, name, description, duration_days, price,
            JSON.stringify(includes || []),
            JSON.stringify(excludes || [])
        ]);
        return result.insertId;
    }

    // Get packages by hostel
    static async getByHostel(hostelId) {
        const query = 'SELECT * FROM hotel_packages WHERE hostel_id = ? AND is_active = TRUE';
        const [rows] = await pool.execute(query, [hostelId]);
        return rows;
    }

    // Get package by ID
    static async getById(id) {
        const query = 'SELECT * FROM hotel_packages WHERE id = ?';
        const [rows] = await pool.execute(query, [id]);
        return rows[0];
    }

    // Book package
    static async bookPackage(packageId, userId, checkIn, checkOut, totalPrice) {
        const query = `
            INSERT INTO package_bookings (package_id, user_id, check_in_date, check_out_date, total_price)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await pool.execute(query, [packageId, userId, checkIn, checkOut, totalPrice]);
        return result.insertId;
    }

    // Get package bookings
    static async getBookings(hostelId) {
        const query = `
            SELECT pb.*, hp.name as package_name, u.full_name as user_name, u.email
            FROM package_bookings pb
            JOIN hotel_packages hp ON pb.package_id = hp.id
            JOIN users u ON pb.user_id = u.id
            WHERE hp.hostel_id = ?
            ORDER BY pb.created_at DESC
        `;
        const [rows] = await pool.execute(query, [hostelId]);
        return rows;
    }
}

module.exports = Package;