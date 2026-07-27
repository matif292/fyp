const pool = require('../config/database');

const DEFAULT_RULES = {
    auto_negotiation_enabled: true,
    auto_accept_threshold: 90,
    auto_counter_threshold: 75,
    counter_offer_percentage: 85,
    counter_min_price: null,
    counter_max_price: null,
    manual_only: false,
};

class Negotiation {
    static async getRules(hostelId) {
        const [rows] = await pool.execute('SELECT * FROM hostel_negotiation_rules WHERE hostel_id = ?', [hostelId]);
        if (rows.length === 0) return { hostel_id: Number(hostelId), ...DEFAULT_RULES };
        const r = rows[0];
        return {
            ...r,
            auto_negotiation_enabled: !!r.auto_negotiation_enabled,
            manual_only: !!r.manual_only,
        };
    }

    static async upsertRules(hostelId, rules) {
        const query = `
            INSERT INTO hostel_negotiation_rules
                (hostel_id, auto_negotiation_enabled, auto_accept_threshold, auto_counter_threshold,
                 counter_offer_percentage, counter_min_price, counter_max_price, manual_only)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                auto_negotiation_enabled = VALUES(auto_negotiation_enabled),
                auto_accept_threshold = VALUES(auto_accept_threshold),
                auto_counter_threshold = VALUES(auto_counter_threshold),
                counter_offer_percentage = VALUES(counter_offer_percentage),
                counter_min_price = VALUES(counter_min_price),
                counter_max_price = VALUES(counter_max_price),
                manual_only = VALUES(manual_only)
        `;
        await pool.execute(query, [
            hostelId,
            rules.auto_negotiation_enabled ? 1 : 0,
            rules.auto_accept_threshold ?? DEFAULT_RULES.auto_accept_threshold,
            rules.auto_counter_threshold ?? DEFAULT_RULES.auto_counter_threshold,
            rules.counter_offer_percentage ?? DEFAULT_RULES.counter_offer_percentage,
            rules.counter_min_price ?? null,
            rules.counter_max_price ?? null,
            rules.manual_only ? 1 : 0,
        ]);
        return this.getRules(hostelId);
    }

    static async hasPending(userId, roomTypeId) {
        const [rows] = await pool.execute(
            `SELECT id FROM negotiations WHERE user_id = ? AND room_type_id = ? AND status IN ('pending','counter')`,
            [userId, roomTypeId]
        );
        return rows.length > 0;
    }

    static async create(data) {
        const query = `
            INSERT INTO negotiations
                (user_id, hostel_id, room_type_id, offered_price, system_price, status, counter_offer,
                 check_in_date, check_out_date, total_guests, reason, expires_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 48 HOUR))
        `;
        const [result] = await pool.execute(query, [
            data.user_id, data.hostel_id, data.room_type_id, data.offered_price, data.system_price,
            data.status, data.counter_offer ?? null, data.check_in_date, data.check_out_date,
            data.total_guests || 1, data.reason || null,
        ]);
        return result.insertId;
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            `SELECT n.*, h.name as hostel_name, rt.name as room_type_name, u.full_name as traveler_name
             FROM negotiations n
             JOIN hostels h ON n.hostel_id = h.id
             JOIN room_types rt ON n.room_type_id = rt.id
             JOIN users u ON n.user_id = u.id
             WHERE n.id = ?`,
            [id]
        );
        return rows[0] || null;
    }

    static async findByUser(userId) {
        const [rows] = await pool.execute(
            `SELECT n.*, h.name as hostel_name, h.city, rt.name as room_type_name
             FROM negotiations n
             JOIN hostels h ON n.hostel_id = h.id
             JOIN room_types rt ON n.room_type_id = rt.id
             WHERE n.user_id = ?
             ORDER BY n.created_at DESC`,
            [userId]
        );
        return rows;
    }

    static async findByHostelOwner(ownerId) {
        const [rows] = await pool.execute(
            `SELECT n.*, h.name as hostel_name, rt.name as room_type_name, u.full_name as traveler_name, u.email as traveler_email
             FROM negotiations n
             JOIN hostels h ON n.hostel_id = h.id
             JOIN room_types rt ON n.room_type_id = rt.id
             JOIN users u ON n.user_id = u.id
             WHERE h.owner_id = ?
             ORDER BY n.created_at DESC`,
            [ownerId]
        );
        return rows;
    }

    static async updateStatus(id, status, extra = {}) {
        const fields = ['status = ?'];
        const values = [status];
        if (extra.counter_offer !== undefined) { fields.push('counter_offer = ?'); values.push(extra.counter_offer); }
        if (extra.resulting_booking_id !== undefined) { fields.push('resulting_booking_id = ?'); values.push(extra.resulting_booking_id); }
        if (extra.reason !== undefined) { fields.push('reason = ?'); values.push(extra.reason); }
        values.push(id);
        await pool.execute(`UPDATE negotiations SET ${fields.join(', ')} WHERE id = ?`, values);
        return this.findById(id);
    }
}

module.exports = Negotiation;
