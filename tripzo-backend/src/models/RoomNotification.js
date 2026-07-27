const pool = require('../config/database');

class RoomNotification {
    static async create({ owner_id, hostel_id, booking_id = null, type = 'booking', message }) {
        const [result] = await pool.execute(
            `INSERT INTO room_notifications (owner_id, hostel_id, booking_id, type, message) VALUES (?, ?, ?, ?, ?)`,
            [owner_id, hostel_id, booking_id, type, message]
        );
        return result.insertId;
    }

    static async findByOwner(ownerId, { unreadOnly = false, limit = 50 } = {}) {
        const params = [ownerId];
        let query = `
            SELECT n.*, h.name AS hostel_name, b.booking_number
            FROM room_notifications n
            LEFT JOIN hostels h ON n.hostel_id = h.id
            LEFT JOIN bookings b ON n.booking_id = b.id
            WHERE n.owner_id = ?
        `;
        if (unreadOnly) query += ' AND n.is_read = FALSE';
        query += ' ORDER BY n.created_at DESC LIMIT ?';
        params.push(limit);
        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async getUnreadCount(ownerId) {
        const [rows] = await pool.execute(
            `SELECT COUNT(*) AS count FROM room_notifications WHERE owner_id = ? AND is_read = FALSE`,
            [ownerId]
        );
        return rows[0].count;
    }

    static async markRead(id, ownerId) {
        const [result] = await pool.execute(
            `UPDATE room_notifications SET is_read = TRUE WHERE id = ? AND owner_id = ?`,
            [id, ownerId]
        );
        return result.affectedRows > 0;
    }

    static async markAllRead(ownerId) {
        const [result] = await pool.execute(
            `UPDATE room_notifications SET is_read = TRUE WHERE owner_id = ? AND is_read = FALSE`,
            [ownerId]
        );
        return result.affectedRows;
    }
}

module.exports = RoomNotification;
