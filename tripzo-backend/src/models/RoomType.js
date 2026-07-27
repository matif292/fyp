// const pool = require('../config/database');

// class RoomType {
//     // Create room type
//     static async create(roomData) {
//         try {
//             console.log('📝 Creating room type with data:', roomData);
            
//             const {
//                 hostel_id,
//                 name,
//                 description,
//                 capacity,
//                 price_per_night,
//                 total_rooms,
//                 amenities
//             } = roomData;

//             const query = `
//                 INSERT INTO room_types 
//                 (hostel_id, name, description, capacity, price_per_night, total_rooms, amenities)
//                 VALUES (?, ?, ?, ?, ?, ?, ?)
//             `;

//             const values = [
//                 hostel_id,
//                 name,
//                 description || '',
//                 capacity || 1,
//                 price_per_night,
//                 total_rooms || 0,
//                 JSON.stringify(amenities || [])
//             ];

//             console.log('📤 Executing query with values:', values);
            
//             const [result] = await pool.execute(query, values);
//             console.log('✅ Room type inserted, ID:', result.insertId);

//             return result.insertId;
//         } catch (error) {
//             console.error('❌ Error creating room type:', error);
//             console.error('SQL Error:', error.sqlMessage);
//             throw error;
//         }
//     }

//     // Get room types by hostel
//     static async findByHostel(hostelId) {
//         try {
//             console.log('📝 Finding room types for hostel:', hostelId);
//             const query = 'SELECT * FROM room_types WHERE hostel_id = ? AND is_active = TRUE ORDER BY price_per_night ASC';
//             const [rows] = await pool.execute(query, [hostelId]);
//             console.log(`✅ Found ${rows.length} room types`);
//             return rows;
//         } catch (error) {
//             console.error('Error finding room types:', error);
//             return [];
//         }
//     }

//     // Get room type by ID
//     static async findById(id) {
//         try {
//             const query = 'SELECT * FROM room_types WHERE id = ?';
//             const [rows] = await pool.execute(query, [id]);
//             return rows[0] || null;
//         } catch (error) {
//             console.error('Error finding room type:', error);
//             throw error;
//         }
//     }

//     // Update room type
//     static async update(id, data) {
//         try {
//             const fields = [];
//             const values = [];

//             Object.keys(data).forEach(key => {
//                 if (data[key] !== undefined && data[key] !== null) {
//                     if (key === 'amenities') {
//                         fields.push(`${key} = ?`);
//                         values.push(JSON.stringify(data[key]));
//                     } else {
//                         fields.push(`${key} = ?`);
//                         values.push(data[key]);
//                     }
//                 }
//             });

//             if (fields.length === 0) return null;

//             values.push(id);
//             const query = `UPDATE room_types SET ${fields.join(', ')} WHERE id = ?`;
//             const [result] = await pool.execute(query, values);
//             return result;
//         } catch (error) {
//             console.error('Error updating room type:', error);
//             throw error;
//         }
//     }

//     // Delete room type (soft delete)
//     static async delete(id) {
//         try {
//             const query = 'UPDATE room_types SET is_active = FALSE WHERE id = ?';
//             const [result] = await pool.execute(query, [id]);
//             return result;
//         } catch (error) {
//             console.error('Error deleting room type:', error);
//             throw error;
//         }
//     }
// }

// module.exports = RoomType;





const pool = require('../config/database');

class RoomType {
    // Create room type
    static async create(roomData) {
        try {
            console.log('📝 Creating room type with data:', roomData);
            
            const {
                hostel_id,
                name,
                description,
                capacity,
                price_per_night,
                total_rooms,
                amenities
            } = roomData;

            const query = `
                INSERT INTO room_types 
                (hostel_id, name, description, capacity, price_per_night, total_rooms, amenities)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                hostel_id,
                name,
                description || '',
                capacity || 1,
                price_per_night,
                total_rooms || 0,
                JSON.stringify(amenities || [])
            ];

            console.log('📤 Executing query with values:', values);
            
            const [result] = await pool.execute(query, values);
            console.log('✅ Room type inserted, ID:', result.insertId);

            return result.insertId;
        } catch (error) {
            console.error('❌ Error creating room type:', error);
            console.error('SQL Error:', error.sqlMessage);
            throw error;
        }
    }

    // Get room types by hostel
    static async findByHostel(hostelId) {
        try {
            console.log('📝 Finding room types for hostel:', hostelId);
            const query = 'SELECT * FROM room_types WHERE hostel_id = ? AND is_active = TRUE ORDER BY price_per_night ASC';
            const [rows] = await pool.execute(query, [hostelId]);
            console.log(`✅ Found ${rows.length} room types`);
            return rows;
        } catch (error) {
            console.error('Error finding room types:', error);
            return [];
        }
    }

    // Get room type by ID
    static async findById(id) {
        try {
            const query = 'SELECT * FROM room_types WHERE id = ?';
            const [rows] = await pool.execute(query, [id]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error finding room type:', error);
            throw error;
        }
    }

    // Update room type
    static async update(id, data) {
        try {
            const fields = [];
            const values = [];

            Object.keys(data).forEach(key => {
                if (data[key] !== undefined && data[key] !== null) {
                    if (key === 'amenities') {
                        fields.push(`${key} = ?`);
                        values.push(JSON.stringify(data[key]));
                    } else {
                        fields.push(`${key} = ?`);
                        values.push(data[key]);
                    }
                }
            });

            if (fields.length === 0) return null;

            values.push(id);
            const query = `UPDATE room_types SET ${fields.join(', ')} WHERE id = ?`;
            const [result] = await pool.execute(query, values);
            return result;
        } catch (error) {
            console.error('Error updating room type:', error);
            throw error;
        }
    }

    // Delete room type (soft delete)
    static async delete(id) {
        try {
            const query = 'UPDATE room_types SET is_active = FALSE WHERE id = ?';
            const [result] = await pool.execute(query, [id]);
            return result;
        } catch (error) {
            console.error('Error deleting room type:', error);
            throw error;
        }
    }
}

module.exports = RoomType;