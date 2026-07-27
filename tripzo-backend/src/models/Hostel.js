// // const pool = require('../config/database');

// // class Hostel {
// //     // Create hostel
// //     static async create(hostelData) {
// //         const {
// //             owner_id,
// //             name,
// //             property_type,
// //             description,
// //             address,
// //             city,
// //             state,
// //             country,
// //             latitude,
// //             longitude,
// //             total_rooms,
// //             amenities,
// //             room_types,
// //             check_in_time,
// //             check_out_time,
// //             cancellation_policy,
// //             min_stay_days
// //         } = hostelData;

// //         const query = `
// //             INSERT INTO hostels 
// //             (owner_id, name, property_type, description, address, city, state, country,
// //              latitude, longitude, total_rooms, amenities, room_types, check_in_time,
// //              check_out_time, cancellation_policy, min_stay_days)
// //             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
// //         `;

// //         const [result] = await pool.execute(query, [
// //             owner_id,
// //             name,
// //             property_type,
// //             description,
// //             address,
// //             city,
// //             state,
// //             country,
// //             latitude,
// //             longitude,
// //             total_rooms,
// //             JSON.stringify(amenities),
// //             JSON.stringify(room_types),
// //             check_in_time,
// //             check_out_time,
// //             cancellation_policy,
// //             min_stay_days || 1
// //         ]);

// //         return result.insertId;
// //     }

// //     // Get hostel by ID
// //     static async findById(id) {
// //         const query = 'SELECT * FROM hostels WHERE id = ?';
// //         const [rows] = await pool.execute(query, [id]);
// //         return rows[0];
// //     }

// //     // Get hostels by owner
// //     static async findByOwner(ownerId) {
// //         const query = 'SELECT * FROM hostels WHERE owner_id = ? ORDER BY created_at DESC';
// //         const [rows] = await pool.execute(query, [ownerId]);
// //         return rows;
// //     }

// //     // Get all hostels with filters
// //     static async findAll(filters = {}) {
// //         let query = `
// //             SELECT h.*, u.full_name as owner_name,
// //             (SELECT COUNT(*) FROM reviews WHERE hostel_id = h.id) as review_count
// //             FROM hostels h
// //             JOIN users u ON h.owner_id = u.id
// //             WHERE h.is_active = TRUE
// //         `;
// //         const params = [];

// //         if (filters.city) {
// //             query += ' AND h.city = ?';
// //             params.push(filters.city);
// //         }

// //         if (filters.minPrice) {
// //             query += ' AND EXISTS (SELECT 1 FROM room_types rt WHERE rt.hostel_id = h.id AND rt.price_per_night >= ?)';
// //             params.push(filters.minPrice);
// //         }

// //         if (filters.maxPrice) {
// //             query += ' AND EXISTS (SELECT 1 FROM room_types rt WHERE rt.hostel_id = h.id AND rt.price_per_night <= ?)';
// //             params.push(filters.maxPrice);
// //         }

// //         if (filters.search) {
// //             query += ' AND MATCH(h.name, h.description) AGAINST(?)';
// //             params.push(filters.search);
// //         }

// //         query += ' ORDER BY h.rating DESC, h.created_at DESC';

// //         if (filters.limit) {
// //             query += ' LIMIT ?';
// //             params.push(filters.limit);
// //         }

// //         const [rows] = await pool.execute(query, params);
// //         return rows;
// //     }

// //     // Update hostel
// //     static async update(id, data) {
// //         const fields = [];
// //         const values = [];

// //         Object.keys(data).forEach(key => {
// //             if (data[key] !== undefined) {
// //                 if (key === 'amenities' || key === 'room_types') {
// //                     fields.push(`${key} = ?`);
// //                     values.push(JSON.stringify(data[key]));
// //                 } else {
// //                     fields.push(`${key} = ?`);
// //                     values.push(data[key]);
// //                 }
// //             }
// //         });

// //         if (fields.length === 0) return null;

// //         values.push(id);
// //         const query = `UPDATE hostels SET ${fields.join(', ')} WHERE id = ?`;
// //         const [result] = await pool.execute(query, values);
// //         return result;
// //     }

// //     // Get hostel with photos
// //     static async getWithPhotos(hostelId) {
// //         const query = `
// //             SELECT h.*, 
// //             JSON_ARRAYAGG(
// //                 JSON_OBJECT(
// //                     'id', hp.id,
// //                     'url', hp.photo_url,
// //                     'is_primary', hp.is_primary
// //                 )
// //             ) as photos
// //             FROM hostels h
// //             LEFT JOIN hostel_photos hp ON h.id = hp.hostel_id
// //             WHERE h.id = ?
// //             GROUP BY h.id
// //         `;
// //         const [rows] = await pool.execute(query, [hostelId]);
// //         return rows[0];
// //     }
// // }

// // module.exports = Hostel;



// const pool = require('../config/database');

// class Hostel {
//     // Create hostel
//     static async create(hostelData) {
//         try {
//             const {
//                 owner_id,
//                 name,
//                 property_type,
//                 description,
//                 address,
//                 city,
//                 state,
//                 country,
//                 latitude,
//                 longitude,
//                 total_rooms,
//                 amenities,
//                 room_types,
//                 check_in_time,
//                 check_out_time,
//                 cancellation_policy,
//                 min_stay_days
//             } = hostelData;

//             const query = `
//                 INSERT INTO hostels 
//                 (owner_id, name, property_type, description, address, city, state, country,
//                  latitude, longitude, total_rooms, amenities, room_types, check_in_time,
//                  check_out_time, cancellation_policy, min_stay_days)
//                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//             `;

//             const [result] = await pool.execute(query, [
//                 owner_id,
//                 name,
//                 property_type,
//                 description,
//                 address,
//                 city,
//                 state,
//                 country,
//                 latitude,
//                 longitude,
//                 total_rooms,
//                 JSON.stringify(amenities || []),
//                 JSON.stringify(room_types || []),
//                 check_in_time,
//                 check_out_time,
//                 cancellation_policy,
//                 min_stay_days || 1
//             ]);

//             return result.insertId;
//         } catch (error) {
//             console.error('Error creating hostel:', error);
//             throw error;
//         }
//     }

//     // Get hostel by ID
//     static async findById(id) {
//         try {
//             const query = 'SELECT * FROM hostels WHERE id = ?';
//             const [rows] = await pool.execute(query, [id]);
//             return rows[0] || null;
//         } catch (error) {
//             console.error('Error finding hostel by ID:', error);
//             throw error;
//         }
//     }

//     // Get hostels by owner
//     static async findByOwner(ownerId) {
//         try {
//             const query = 'SELECT * FROM hostels WHERE owner_id = ? ORDER BY created_at DESC';
//             const [rows] = await pool.execute(query, [ownerId]);
//             return rows;
//         } catch (error) {
//             console.error('Error finding hostels by owner:', error);
//             throw error;
//         }
//     }

//     // Get all hostels with filters
//     static async findAll(filters = {}) {
//         try {
//             let query = `
//                 SELECT h.*, u.full_name as owner_name,
//                 (SELECT COUNT(*) FROM reviews WHERE hostel_id = h.id) as review_count
//                 FROM hostels h
//                 JOIN users u ON h.owner_id = u.id
//                 WHERE h.is_active = TRUE
//             `;
//             const params = [];

//             if (filters.city) {
//                 query += ' AND h.city = ?';
//                 params.push(filters.city);
//             }

//             if (filters.minPrice) {
//                 query += ' AND EXISTS (SELECT 1 FROM room_types rt WHERE rt.hostel_id = h.id AND rt.price_per_night >= ?)';
//                 params.push(filters.minPrice);
//             }

//             if (filters.maxPrice) {
//                 query += ' AND EXISTS (SELECT 1 FROM room_types rt WHERE rt.hostel_id = h.id AND rt.price_per_night <= ?)';
//                 params.push(filters.maxPrice);
//             }

//             if (filters.search) {
//                 query += ' AND (h.name LIKE ? OR h.description LIKE ?)';
//                 const searchTerm = `%${filters.search}%`;
//                 params.push(searchTerm, searchTerm);
//             }

//             query += ' ORDER BY h.rating DESC, h.created_at DESC';

//             if (filters.limit) {
//                 query += ' LIMIT ?';
//                 params.push(filters.limit);
//             }

//             const [rows] = await pool.execute(query, params);
//             return rows;
//         } catch (error) {
//             console.error('Error finding all hostels:', error);
//             throw error;
//         }
//     }

//     // Update hostel
//     // Update hostel
//     static async update(id, data) {
//         try {
//             console.log('📝 Updating hostel with data:', data);
            
//             const fields = [];
//             const values = [];

//             Object.keys(data).forEach(key => {
//                 if (data[key] !== undefined && data[key] !== null) {
//                     // Handle JSON fields
//                     if (key === 'amenities' || key === 'room_types') {
//                         fields.push(`${key} = ?`);
//                         values.push(JSON.stringify(data[key]));
//                     } else {
//                         fields.push(`${key} = ?`);
//                         values.push(data[key]);
//                     }
//                 }
//             });

//             if (fields.length === 0) {
//                 console.log('⚠️ No fields to update');
//                 return null;
//             }

//             values.push(id);
//             const query = `UPDATE hostels SET ${fields.join(', ')} WHERE id = ?`;
//             console.log('📤 Executing query:', query);
//             console.log('📤 With values:', values);
            
//             const [result] = await pool.execute(query, values);
//             console.log('✅ Update result:', result);
            
//             return result;
//         } catch (error) {
//             console.error('❌ Error updating hostel:', error);
//             console.error('SQL Error:', error.sqlMessage);
//             throw error;
//         }
//     }

//     // Get hostel with photos (FIXED)
//     static async getWithPhotos(hostelId) {
//         try {
//             // Get hostel details
//             const hostel = await this.findById(hostelId);
//             if (!hostel) {
//                 return null;
//             }

//             // Get photos
//             const photoQuery = 'SELECT id, photo_url, is_primary, sort_order FROM hostel_photos WHERE hostel_id = ? ORDER BY is_primary DESC, sort_order ASC';
//             const [photos] = await pool.execute(photoQuery, [hostelId]);

//             return {
//                 ...hostel,
//                 photos: photos || []
//             };
//         } catch (error) {
//             console.error('Error getting hostel with photos:', error);
//             // Return basic hostel info if photos fail
//             const hostel = await this.findById(hostelId);
//             if (hostel) {
//                 return {
//                     ...hostel,
//                     photos: []
//                 };
//             }
//             return null;
//         }
//     }
// }

// // module.exports = Hostel;



const pool = require('../config/database');

// Photos were historically saved with the OS path separator (Windows
// backslashes), which breaks URLs on the frontend. Always normalize to
// forward slashes and strip any leading uploads-relative prefix noise.
const normalizePhotoUrl = (photoUrl) => {
    if (!photoUrl) return photoUrl;
    return photoUrl.replace(/\\/g, '/');
};

// Attach a `photos` array (and a convenience `has_360` flag) to a list of
// hostel rows using a single bulk query, so hostel listings can render
// thumbnails without an N+1 request per card.
const attachPhotos = async (hostels) => {
    if (!hostels.length) return hostels;

    const ids = hostels.map((h) => h.id);
    const placeholders = ids.map(() => '?').join(',');
    const [photoRows] = await pool.query(
        `SELECT id, hostel_id, photo_url, is_primary, is_360, sort_order
         FROM hostel_photos
         WHERE hostel_id IN (${placeholders})
         ORDER BY is_primary DESC, sort_order ASC`,
        ids
    );

    const photosByHostel = {};
    photoRows.forEach((photo) => {
        const normalized = { ...photo, photo_url: normalizePhotoUrl(photo.photo_url) };
        if (!photosByHostel[photo.hostel_id]) photosByHostel[photo.hostel_id] = [];
        photosByHostel[photo.hostel_id].push(normalized);
    });

    return hostels.map((h) => {
        const photos = photosByHostel[h.id] || [];
        return { ...h, photos, has_360: photos.some((p) => p.is_360) };
    });
};

class Hostel {
    // Create hostel
    static async create(hostelData) {
        try {
            console.log('📝 Creating hostel with data:', hostelData);
            
            const {
                owner_id,
                name,
                property_type,
                description,
                address,
                city,
                state,
                country,
                latitude,
                longitude,
                total_rooms,
                amenities,
                room_types,
                check_in_time,
                check_out_time,
                cancellation_policy,
                min_stay_days
            } = hostelData;

            const query = `
                INSERT INTO hostels 
                (owner_id, name, property_type, description, address, city, state, country,
                 latitude, longitude, total_rooms, amenities, room_types, check_in_time,
                 check_out_time, cancellation_policy, min_stay_days)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                owner_id,
                name,
                property_type || 'hostel',
                description || '',
                address,
                city,
                state || '',
                country || 'Pakistan',
                latitude || null,
                longitude || null,
                total_rooms || 0,
                JSON.stringify(amenities || []),
                JSON.stringify(room_types || []),
                check_in_time || '14:00:00',
                check_out_time || '12:00:00',
                cancellation_policy || 'moderate',
                min_stay_days || 1
            ];

            console.log('📤 Executing hostel insert query');
            const [result] = await pool.execute(query, values);
            console.log('✅ Hostel inserted, ID:', result.insertId);

            return result.insertId;
        } catch (error) {
            console.error('❌ Error creating hostel:', error);
            console.error('SQL Error:', error.sqlMessage);
            throw error;
        }
    }

    // Get hostel by ID
    static async findById(id) {
        try {
            const query = 'SELECT * FROM hostels WHERE id = ?';
            const [rows] = await pool.execute(query, [id]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error finding hostel:', error);
            throw error;
        }
    }

    // Get hostels by owner
    static async findByOwner(ownerId) {
        try {
            const query = 'SELECT * FROM hostels WHERE owner_id = ? ORDER BY created_at DESC';
            const [rows] = await pool.execute(query, [ownerId]);
            return attachPhotos(rows);
        } catch (error) {
            console.error('Error finding hostels by owner:', error);
            throw error;
        }
    }

    // Get all hostels with filters
    static async findAll(filters = {}) {
        try {
            let query = `
                SELECT h.*, u.full_name as owner_name,
                (SELECT COUNT(*) FROM reviews WHERE hostel_id = h.id) as review_count
                FROM hostels h
                JOIN users u ON h.owner_id = u.id
                WHERE h.is_active = TRUE
            `;
            const params = [];

            if (filters.city) {
                query += ' AND h.city = ?';
                params.push(filters.city);
            }

            if (filters.minPrice) {
                query += ' AND EXISTS (SELECT 1 FROM room_types rt WHERE rt.hostel_id = h.id AND rt.price_per_night >= ?)';
                params.push(filters.minPrice);
            }

            if (filters.maxPrice) {
                query += ' AND EXISTS (SELECT 1 FROM room_types rt WHERE rt.hostel_id = h.id AND rt.price_per_night <= ?)';
                params.push(filters.maxPrice);
            }

            if (filters.search) {
                query += ' AND (h.name LIKE ? OR h.description LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm);
            }

            query += ' ORDER BY h.rating DESC, h.created_at DESC';

            if (filters.limit) {
                query += ' LIMIT ?';
                params.push(parseInt(filters.limit));
            }

            const [rows] = await pool.execute(query, params);
            return attachPhotos(rows);
        } catch (error) {
            console.error('Error finding all hostels:', error);
            throw error;
        }
    }

    // Update hostel
    static async update(id, data) {
        try {
            const fields = [];
            const values = [];

            Object.keys(data).forEach(key => {
                if (data[key] !== undefined && data[key] !== null) {
                    if (key === 'amenities' || key === 'room_types') {
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
            const query = `UPDATE hostels SET ${fields.join(', ')} WHERE id = ?`;
            const [result] = await pool.execute(query, values);
            return result;
        } catch (error) {
            console.error('Error updating hostel:', error);
            throw error;
        }
    }
}

module.exports = Hostel;
module.exports.normalizePhotoUrl = normalizePhotoUrl;