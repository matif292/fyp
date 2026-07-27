const pool = require('../config/database');

class PlatformSettings {
    static async get() {
        const [rows] = await pool.execute('SELECT * FROM platform_settings WHERE id = 1');
        if (rows.length === 0) {
            await pool.execute('INSERT INTO platform_settings (id) VALUES (1)');
            const [fresh] = await pool.execute('SELECT * FROM platform_settings WHERE id = 1');
            return fresh[0];
        }
        return rows[0];
    }

    static async update(data) {
        const fields = [];
        const values = [];
        ['maintenance_mode', 'auto_approve_owners', 'announcement_banner'].forEach((key) => {
            if (data[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(data[key]);
            }
        });
        if (fields.length === 0) return this.get();
        await pool.execute(`UPDATE platform_settings SET ${fields.join(', ')} WHERE id = 1`, values);
        return this.get();
    }
}

module.exports = PlatformSettings;
