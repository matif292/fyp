const pool = require('../config/database');

class Booking {
    // Create booking
    static async create(bookingData) {
        try {
            console.log('📝 Creating booking with data:', bookingData);
            
            const {
                booking_number,
                traveler_id,
                hostel_id,
                room_type_id,
                check_in_date,
                check_out_date,
                total_guests,
                total_price,
                special_requests,
                payment_method
            } = bookingData;

            const query = `
                INSERT INTO bookings 
                (booking_number, traveler_id, hostel_id, room_type_id, 
                 check_in_date, check_out_date, total_guests, total_price, 
                 special_requests, payment_method)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                booking_number,
                traveler_id,
                hostel_id,
                room_type_id,
                check_in_date,
                check_out_date,
                total_guests || 1,
                total_price,
                special_requests || null,
                payment_method || null
            ];

            console.log('📤 Executing query with values:', values);
            
            const [result] = await pool.execute(query, values);
            console.log('✅ Booking inserted, ID:', result.insertId);

            return result.insertId;
        } catch (error) {
            console.error('❌ Error creating booking:', error);
            console.error('SQL Error:', error.sqlMessage);
            throw error;
        }
    }

    // Get booking by ID
    static async findById(id) {
        try {
            const query = `
                SELECT b.*, 
                       u.full_name as traveler_name,
                       u.email as traveler_email,
                       h.name as hostel_name,
                       rt.name as room_type_name
                FROM bookings b
                LEFT JOIN users u ON b.traveler_id = u.id
                LEFT JOIN hostels h ON b.hostel_id = h.id
                LEFT JOIN room_types rt ON b.room_type_id = rt.id
                WHERE b.id = ?
            `;
            const [rows] = await pool.execute(query, [id]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error finding booking:', error);
            throw error;
        }
    }

    // Get bookings by traveler
    static async findByTraveler(travelerId) {
        try {
            const query = `
                SELECT b.*, 
                       h.name as hostel_name,
                       h.city as hostel_city,
                       rt.name as room_type_name,
                       u.full_name as owner_name
                FROM bookings b
                LEFT JOIN hostels h ON b.hostel_id = h.id
                LEFT JOIN room_types rt ON b.room_type_id = rt.id
                LEFT JOIN users u ON h.owner_id = u.id
                WHERE b.traveler_id = ?
                ORDER BY b.created_at DESC
            `;
            const [rows] = await pool.execute(query, [travelerId]);
            return rows;
        } catch (error) {
            console.error('Error finding bookings by traveler:', error);
            throw error;
        }
    }

    // Get bookings by hostel (for owner)
    static async findByHostel(hostelId) {
        try {
            const query = `
                SELECT b.*, 
                       u.full_name as traveler_name,
                       u.email as traveler_email,
                       u.phone as traveler_phone,
                       rt.name as room_type_name
                FROM bookings b
                LEFT JOIN users u ON b.traveler_id = u.id
                LEFT JOIN room_types rt ON b.room_type_id = rt.id
                WHERE b.hostel_id = ?
                ORDER BY b.created_at DESC
            `;
            const [rows] = await pool.execute(query, [hostelId]);
            return rows;
        } catch (error) {
            console.error('Error finding bookings by hostel:', error);
            throw error;
        }
    }

    // Update booking status
    static async updateStatus(id, status) {
        try {
            const query = 'UPDATE bookings SET status = ? WHERE id = ?';
            const [result] = await pool.execute(query, [status, id]);
            return result;
        } catch (error) {
            console.error('Error updating booking status:', error);
            throw error;
        }
    }

    // Update payment status
    static async updatePaymentStatus(id, payment_status) {
        try {
            const query = 'UPDATE bookings SET payment_status = ? WHERE id = ?';
            const [result] = await pool.execute(query, [payment_status, id]);
            return result;
        } catch (error) {
            console.error('Error updating payment status:', error);
            throw error;
        }
    }

    // Cancel booking
    static async cancel(id) {
        try {
            const query = 'UPDATE bookings SET status = "cancelled" WHERE id = ?';
            const [result] = await pool.execute(query, [id]);
            return result;
        } catch (error) {
            console.error('Error cancelling booking:', error);
            throw error;
        }
    }

    // Check room availability
    static async checkAvailability(hostelId, roomTypeId, checkIn, checkOut) {
        try {
            const query = `
                SELECT COUNT(*) as booked_count
                FROM bookings
                WHERE hostel_id = ? 
                AND room_type_id = ?
                AND status != 'cancelled'
                AND (
                    (check_in_date <= ? AND check_out_date > ?) OR
                    (check_in_date < ? AND check_out_date >= ?) OR
                    (check_in_date >= ? AND check_out_date <= ?)
                )
            `;
            const [rows] = await pool.execute(query, [
                hostelId, 
                roomTypeId, 
                checkOut, checkIn,
                checkOut, checkIn,
                checkIn, checkOut
            ]);
            return rows[0].booked_count;
        } catch (error) {
            console.error('Error checking availability:', error);
            throw error;
        }
    }

    // Generate booking number
    static generateBookingNumber() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `TRIP-${timestamp}-${random}`;
    }
}

module.exports = Booking;