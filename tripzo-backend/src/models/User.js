const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    // Create user with comprehensive error handling
    static async create(userData) {
        const {
            full_name,
            email,
            phone,
            password,
            role = 'traveler',
            profile_photo = null,
            date_of_birth = null,
            preferred_language = 'en'
        } = userData;

        try {
            // Hash password
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);

            const query = `
                INSERT INTO users 
                (full_name, email, phone, password_hash, role, profile_photo, date_of_birth, preferred_language)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const [result] = await pool.execute(query, [
                full_name,
                email,
                phone,
                password_hash,
                role,
                profile_photo,
                date_of_birth,
                preferred_language
            ]);

            return result.insertId;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    // Find user by email
    static async findByEmail(email) {
        try {
            const query = 'SELECT * FROM users WHERE email = ?';
            const [rows] = await pool.execute(query, [email]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    }

    // Find user by ID
    static async findById(id) {
        try {
            const query = 'SELECT * FROM users WHERE id = ?';
            const [rows] = await pool.execute(query, [id]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw error;
        }
    }

    // Update user
    static async update(id, data) {
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

            values.push(id);
            const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
            const [result] = await pool.execute(query, values);
            return result;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    // Save OTP
    static async saveOTP(email, otpCode) {
        try {
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
            const query = 'UPDATE users SET otp_code = ?, otp_expires = ? WHERE email = ?';
            await pool.execute(query, [otpCode, expiresAt, email]);
        } catch (error) {
            console.error('Error saving OTP:', error);
            throw error;
        }
    }

    // Verify OTP
    static async verifyOTP(email, otpCode) {
        try {
            const query = 'SELECT * FROM users WHERE email = ? AND otp_code = ? AND otp_expires > NOW()';
            const [rows] = await pool.execute(query, [email, otpCode]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error verifying OTP:', error);
            throw error;
        }
    }

    // Verify email
    static async verifyEmail(email) {
        try {
            const query = 'UPDATE users SET email_verified = TRUE, otp_code = NULL, otp_expires = NULL WHERE email = ?';
            await pool.execute(query, [email]);
        } catch (error) {
            console.error('Error verifying email:', error);
            throw error;
        }
    }

    // Compare password
    static async comparePassword(plainPassword, hashedPassword) {
        try {
            return await bcrypt.compare(plainPassword, hashedPassword);
        } catch (error) {
            console.error('Error comparing password:', error);
            throw error;
        }
    }

    // Get user with owner details
    static async getUserWithOwnerDetails(userId) {
        try {
            const query = `
                SELECT u.*, od.* 
                FROM users u
                LEFT JOIN owner_details od ON u.id = od.user_id
                WHERE u.id = ?
            `;
            const [rows] = await pool.execute(query, [userId]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error getting user with owner details:', error);
            throw error;
        }
    }

    // Check if user exists (for registration validation)
    static async exists(email, phone = null) {
        try {
            let query = 'SELECT id FROM users WHERE email = ?';
            const params = [email];
            
            if (phone) {
                query += ' OR phone = ?';
                params.push(phone);
            }
            
            const [rows] = await pool.execute(query, params);
            return rows.length > 0;
        } catch (error) {
            console.error('Error checking user existence:', error);
            throw error;
        }
    }
}

module.exports = User;