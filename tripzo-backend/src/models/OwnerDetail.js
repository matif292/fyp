const pool = require('../config/database');

class OwnerDetail {
    // Create owner details
    static async create(ownerData) {
        try {
            console.log('📝 Creating owner details with data:', ownerData);
            
            const {
                user_id,
                cnic_number,
                cnic_front,
                cnic_back,
                business_reg_number,
                business_license,
                bank_name,
                account_title,
                account_number,
                iban,
                bank_letter
            } = ownerData;

            // Check if owner_details table exists
            try {
                const [tables] = await pool.execute('SHOW TABLES LIKE "owner_details"');
                if (tables.length === 0) {
                    console.log('⚠️ owner_details table does not exist! Creating...');
                    await pool.execute(`
                        CREATE TABLE IF NOT EXISTS owner_details (
                            id INT PRIMARY KEY AUTO_INCREMENT,
                            user_id INT NOT NULL,
                            cnic_number VARCHAR(50) NOT NULL,
                            cnic_front VARCHAR(255) NOT NULL,
                            cnic_back VARCHAR(255) NOT NULL,
                            business_reg_number VARCHAR(100),
                            business_license VARCHAR(255),
                            bank_name VARCHAR(100),
                            account_title VARCHAR(255),
                            account_number VARCHAR(50),
                            iban VARCHAR(50),
                            bank_letter VARCHAR(255),
                            is_approved BOOLEAN DEFAULT FALSE,
                            approved_at DATETIME,
                            rejected_at DATETIME,
                            rejection_reason TEXT,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                        )
                    `);
                    console.log('✅ owner_details table created');
                }
            } catch (err) {
                console.log('Error checking table:', err.message);
            }

            const query = `
                INSERT INTO owner_details 
                (user_id, cnic_number, cnic_front, cnic_back, business_reg_number, 
                 business_license, bank_name, account_title, account_number, iban, bank_letter)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                user_id,
                cnic_number,
                cnic_front,
                cnic_back,
                business_reg_number || null,
                business_license || null,
                bank_name || null,
                account_title || null,
                account_number || null,
                iban || null,
                bank_letter || null
            ];

            console.log('📤 Executing query with values:', values);
            const [result] = await pool.execute(query, values);
            console.log('✅ Owner details inserted, ID:', result.insertId);

            return result.insertId;
        } catch (error) {
            console.error('❌ Error creating owner details:', error);
            console.error('SQL Error:', error.sqlMessage);
            throw error;
        }
    }

    // Get owner details by user ID
    static async findByUserId(userId) {
        try {
            const query = 'SELECT * FROM owner_details WHERE user_id = ?';
            const [rows] = await pool.execute(query, [userId]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error finding owner details:', error);
            throw error;
        }
    }

    // Update owner details
    static async update(userId, data) {
        try {
            const fields = [];
            const values = [];

            Object.keys(data).forEach(key => {
                if (data[key] !== undefined && data[key] !== null) {
                    fields.push(`${key} = ?`);
                    values.push(data[key]);
                }
            });

            if (fields.length === 0) return null;

            values.push(userId);
            const query = `UPDATE owner_details SET ${fields.join(', ')} WHERE user_id = ?`;
            const [result] = await pool.execute(query, values);
            return result;
        } catch (error) {
            console.error('Error updating owner details:', error);
            throw error;
        }
    }

    // Get pending approvals
    static async getPendingApprovals() {
        try {
            const query = `
                SELECT od.*, u.full_name, u.email, u.phone
                FROM owner_details od
                JOIN users u ON od.user_id = u.id
                WHERE od.is_approved = FALSE AND u.is_active = TRUE
                ORDER BY od.created_at ASC
            `;
            const [rows] = await pool.execute(query);
            return rows;
        } catch (error) {
            console.error('Error getting pending approvals:', error);
            throw error;
        }
    }

    // Approve owner
    static async approve(userId) {
        try {
            const query = `
                UPDATE owner_details 
                SET is_approved = TRUE, approved_at = NOW(), rejected_at = NULL, rejection_reason = NULL
                WHERE user_id = ?
            `;
            await pool.execute(query, [userId]);
            
            // Also update user role to owner if not already
            const userQuery = 'UPDATE users SET role = "owner" WHERE id = ?';
            await pool.execute(userQuery, [userId]);
        } catch (error) {
            console.error('Error approving owner:', error);
            throw error;
        }
    }

    // Reject owner
    static async reject(userId, reason) {
        try {
            const query = `
                UPDATE owner_details 
                SET is_approved = FALSE, rejected_at = NOW(), rejection_reason = ?
                WHERE user_id = ?
            `;
            await pool.execute(query, [reason, userId]);
        } catch (error) {
            console.error('Error rejecting owner:', error);
            throw error;
        }
    }
}

module.exports = OwnerDetail;