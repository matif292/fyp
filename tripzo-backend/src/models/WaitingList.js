const pool = require('../config/database');

class WaitingList {
    static async create(data) {
        const query = `
            INSERT INTO waiting_list (user_id, hostel_id, room_type_id, check_in_date, check_out_date, total_guests)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await pool.execute(query, [
            data.user_id, data.hostel_id, data.room_type_id || null,
            data.check_in_date, data.check_out_date, data.total_guests || 1,
        ]);
        return result.insertId;
    }

    static async findByUser(userId) {
        const [rows] = await pool.execute(
            `SELECT wl.*, h.name as hostel_name, h.city, rt.name as room_type_name
             FROM waiting_list wl
             JOIN hostels h ON wl.hostel_id = h.id
             LEFT JOIN room_types rt ON wl.room_type_id = rt.id
             WHERE wl.user_id = ?
             ORDER BY wl.created_at DESC`,
            [userId]
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.execute('SELECT * FROM waiting_list WHERE id = ?', [id]);
        return rows[0] || null;
    }

    static async remove(id, userId) {
        const [result] = await pool.execute('DELETE FROM waiting_list WHERE id = ? AND user_id = ?', [id, userId]);
        return result.affectedRows > 0;
    }

    static async hasEntry(userId, hostelId, roomTypeId, checkIn, checkOut) {
        const [rows] = await pool.execute(
            `SELECT id FROM waiting_list
             WHERE user_id = ? AND hostel_id = ? AND (room_type_id = ? OR (room_type_id IS NULL AND ? IS NULL))
               AND check_in_date = ? AND check_out_date = ? AND status = 'waiting'`,
            [userId, hostelId, roomTypeId, roomTypeId, checkIn, checkOut]
        );
        return rows.length > 0;
    }

    // Find waiting entries whose dates overlap a newly-freed room, for that hostel/room type
    static async findMatching(hostelId, roomTypeId, checkIn, checkOut) {
        const [rows] = await pool.execute(
            `SELECT wl.*, u.email, u.full_name
             FROM waiting_list wl
             JOIN users u ON wl.user_id = u.id
             WHERE wl.hostel_id = ?
               AND (wl.room_type_id = ? OR wl.room_type_id IS NULL)
               AND wl.status = 'waiting'
               AND wl.check_in_date < ? AND wl.check_out_date > ?`,
            [hostelId, roomTypeId, checkOut, checkIn]
        );
        return rows;
    }

    static async markNotified(id) {
        await pool.execute(`UPDATE waiting_list SET status = 'notified', notified_at = NOW() WHERE id = ?`, [id]);
    }
}

module.exports = WaitingList;
