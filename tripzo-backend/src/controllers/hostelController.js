// // const Hostel = require('../models/Hostel');
// // const RoomType = require('../models/RoomType');
// // const pool = require('../config/database');

// // // @desc    Create hostel
// // // @route   POST /api/hostels
// // // @access  Private (Owner only)
// // exports.createHostel = async (req, res) => {
// //     try {
// //         console.log('📝 Creating hostel...');
// //         console.log('Body:', req.body);
// //         console.log('Files:', req.files ? req.files.length : 0);

// //         const {
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
// //         } = req.body;

// //         // Validate required fields
// //         if (!name || !address || !city) {
// //             return res.status(400).json({
// //                 success: false,
// //                 message: 'Please provide name, address, and city'
// //             });
// //         }

// //         // Check if user is approved owner
// //         if (req.userRole !== 'owner') {
// //             return res.status(403).json({
// //                 success: false,
// //                 message: 'Only approved owners can create hostels'
// //             });
// //         }

// //         // Create hostel
// //         const hostelId = await Hostel.create({
// //             owner_id: req.userId,
// //             name,
// //             property_type: property_type || 'hostel',
// //             description: description || '',
// //             address,
// //             city,
// //             state: state || '',
// //             country: country || 'Pakistan',
// //             latitude: latitude || null,
// //             longitude: longitude || null,
// //             total_rooms: total_rooms || 0,
// //             amenities: amenities ? JSON.parse(amenities) : [],
// //             room_types: room_types ? JSON.parse(room_types) : [],
// //             check_in_time: check_in_time || '14:00:00',
// //             check_out_time: check_out_time || '12:00:00',
// //             cancellation_policy: cancellation_policy || 'moderate',
// //             min_stay_days: min_stay_days || 1
// //         });

// //         console.log('✅ Hostel created with ID:', hostelId);

// //         // Handle photos if uploaded
// //         if (req.files && req.files.length > 0) {
// //             console.log(`📸 Saving ${req.files.length} photos...`);
            
// //             const photoQueries = req.files.map((file, index) => {
// //                 const isPrimary = index === 0;
// //                 return pool.execute(
// //                     'INSERT INTO hostel_photos (hostel_id, photo_url, is_primary, sort_order) VALUES (?, ?, ?, ?)',
// //                     [hostelId, file.path, isPrimary, index]
// //                 );
// //             });
            
// //             await Promise.all(photoQueries);
// //             console.log('✅ Photos saved successfully');
// //         }

// //         res.status(201).json({
// //             success: true,
// //             message: 'Hostel created successfully',
// //             data: { hostelId }
// //         });

// //     } catch (error) {
// //         console.error('❌ Create hostel error:', error);
// //         console.error('Stack:', error.stack);
// //         res.status(500).json({
// //             success: false,
// //             message: 'Server error',
// //             error: process.env.NODE_ENV === 'development' ? error.message : undefined
// //         });
// //     }
// // };

// // // @desc    Get all hostels
// // // @route   GET /api/hostels
// // // @access  Public
// // exports.getHostels = async (req, res) => {
// //     try {
// //         const { city, minPrice, maxPrice, search, limit = 20 } = req.query;

// //         const hostels = await Hostel.findAll({
// //             city,
// //             minPrice,
// //             maxPrice,
// //             search,
// //             limit: parseInt(limit)
// //         });

// //         res.json({
// //             success: true,
// //             count: hostels.length,
// //             data: hostels
// //         });

// //     } catch (error) {
// //         console.error('Get hostels error:', error);
// //         res.status(500).json({
// //             success: false,
// //             message: 'Server error'
// //         });
// //     }
// // };

// // // @desc    Get single hostel
// // // @route   GET /api/hostels/:id
// // // @access  Public
// // exports.getHostel = async (req, res) => {
// //     try {
// //         const hostelId = req.params.id;
// //         console.log('📝 Fetching hostel with ID:', hostelId);

// //         // First, check if hostel exists
// //         const hostel = await Hostel.findById(hostelId);
// //         if (!hostel) {
// //             return res.status(404).json({
// //                 success: false,
// //                 message: 'Hostel not found'
// //             });
// //         }

// //         console.log('✅ Hostel found:', hostel.name);

// //         // Get photos separately
// //         let photos = [];
// //         try {
// //             const photoQuery = 'SELECT id, photo_url, is_primary, sort_order FROM hostel_photos WHERE hostel_id = ? ORDER BY is_primary DESC, sort_order ASC';
// //             const [photoRows] = await pool.execute(photoQuery, [hostelId]);
// //             photos = photoRows;
// //             console.log(`📸 Found ${photos.length} photos`);
// //         } catch (error) {
// //             console.error('Error fetching photos:', error.message);
// //         }

// //         // Get room types separately
// //         let roomTypes = [];
// //         try {
// //             const roomQuery = 'SELECT * FROM room_types WHERE hostel_id = ? AND is_active = TRUE';
// //             const [roomRows] = await pool.execute(roomQuery, [hostelId]);
// //             roomTypes = roomRows;
// //             console.log(`🛏️ Found ${roomTypes.length} room types`);
// //         } catch (error) {
// //             console.error('Error fetching room types:', error.message);
// //         }

// //         // Get owner name
// //         let ownerName = '';
// //         try {
// //             const ownerQuery = 'SELECT full_name FROM users WHERE id = ?';
// //             const [ownerRows] = await pool.execute(ownerQuery, [hostel.owner_id]);
// //             if (ownerRows.length > 0) {
// //                 ownerName = ownerRows[0].full_name;
// //             }
// //         } catch (error) {
// //             console.error('Error fetching owner:', error.message);
// //         }

// //         // Combine all data
// //         const hostelData = {
// //             ...hostel,
// //             owner_name: ownerName,
// //             photos: photos,
// //             room_types: roomTypes
// //         };

// //         res.json({
// //             success: true,
// //             data: hostelData
// //         });

// //     } catch (error) {
// //         console.error('❌ Get hostel error:', error);
// //         console.error('Stack:', error.stack);
// //         res.status(500).json({
// //             success: false,
// //             message: 'Server error',
// //             error: process.env.NODE_ENV === 'development' ? error.message : undefined
// //         });
// //     }
// // };

// // // @desc    Update hostel
// // // @route   PUT /api/hostels/:id
// // // @access  Private (Owner only)
// // exports.updateHostel = async (req, res) => {
// //     try {
// //         const hostelId = req.params.id;
// //         console.log('========================================');
// //         console.log('📝 UPDATE HOSTEL REQUEST');
// //         console.log('========================================');
// //         console.log('Hostel ID:', hostelId);
// //         console.log('User ID from token:', req.userId);
// //         console.log('User Role:', req.userRole);
// //         console.log('Update Data:', req.body);
        
// //         // Check if hostel exists
// //         const hostel = await Hostel.findById(hostelId);
// //         if (!hostel) {
// //             console.log('❌ Hostel not found');
// //             return res.status(404).json({
// //                 success: false,
// //                 message: 'Hostel not found'
// //             });
// //         }
        
// //         console.log('✅ Hostel found:');
// //         console.log('  Name:', hostel.name);
// //         console.log('  Owner ID in DB:', hostel.owner_id);
// //         console.log('  User ID from token:', req.userId);
        
// //         // Check ownership
// //         if (hostel.owner_id !== req.userId && req.userRole !== 'admin') {
// //             console.log('❌ Authorization failed:');
// //             console.log('  Hostel owner_id:', hostel.owner_id);
// //             console.log('  Token user_id:', req.userId);
// //             console.log('  User role:', req.userRole);
            
// //             return res.status(403).json({
// //                 success: false,
// //                 message: 'Unauthorized to update this hostel',
// //                 debug: {
// //                     hostel_owner_id: hostel.owner_id,
// //                     token_user_id: req.userId,
// //                     user_role: req.userRole
// //                 }
// //             });
// //         }

// //         console.log('✅ Authorization passed');

// //         // Update hostel
// //         const updateResult = await Hostel.update(hostelId, req.body);
// //         console.log('✅ Update result:', updateResult);

// //         // Get updated hostel
// //         const updatedHostel = await Hostel.findById(hostelId);

// //         res.json({
// //             success: true,
// //             message: 'Hostel updated successfully',
// //             data: updatedHostel
// //         });

// //     } catch (error) {
// //         console.error('❌ Update hostel error:', error);
// //         console.error('Stack:', error.stack);
// //         res.status(500).json({
// //             success: false,
// //             message: 'Server error during update',
// //             error: process.env.NODE_ENV === 'development' ? error.message : undefined
// //         });
// //     }
// // };

// // // @desc    Get owner's hostels
// // // @route   GET /api/hostels/owner/hostels
// // // @access  Private (Owner only)
// // exports.getOwnerHostels = async (req, res) => {
// //     try {
// //         const hostels = await Hostel.findByOwner(req.userId);

// //         res.json({
// //             success: true,
// //             count: hostels.length,
// //             data: hostels
// //         });

// //     } catch (error) {
// //         console.error('Get owner hostels error:', error);
// //         res.status(500).json({
// //             success: false,
// //             message: 'Server error'
// //         });
// //     }
// // };

// // // @desc    Get room types for a hostel
// // // @route   GET /api/hostels/:hostelId/rooms
// // // @access  Public
// // exports.getRoomTypes = async (req, res) => {
// //     try {
// //         const { hostelId } = req.params;
// //         console.log('📝 Fetching room types for hostel:', hostelId);
        
// //         // Check if hostel exists
// //         const hostel = await Hostel.findById(hostelId);
// //         if (!hostel) {
// //             return res.status(404).json({
// //                 success: false,
// //                 message: 'Hostel not found'
// //             });
// //         }

// //         // Get room types
// //         const roomTypes = await RoomType.findByHostel(hostelId);
        
// //         res.json({
// //             success: true,
// //             count: roomTypes.length,
// //             data: roomTypes
// //         });

// //     } catch (error) {
// //         console.error('❌ Get room types error:', error);
// //         res.status(500).json({
// //             success: false,
// //             message: 'Server error',
// //             error: process.env.NODE_ENV === 'development' ? error.message : undefined
// //         });
// //     }
// // };

// // // @desc    Add room type
// // // @route   POST /api/hostels/:hostelId/rooms
// // // @access  Private (Owner only)
// // exports.addRoomType = async (req, res) => {
// //     try {
// //         const { hostelId } = req.params;
// //         console.log('========================================');
// //         console.log('🛏️ ADD ROOM TYPE');
// //         console.log('========================================');
// //         console.log('Hostel ID:', hostelId);
// //         console.log('User ID:', req.userId);
// //         console.log('Request Body:', req.body);
        
// //         // Check if hostel exists and belongs to owner
// //         const hostel = await Hostel.findById(hostelId);
// //         if (!hostel) {
// //             console.log('❌ Hostel not found');
// //             return res.status(404).json({
// //                 success: false,
// //                 message: 'Hostel not found'
// //             });
// //         }

// //         console.log('✅ Hostel found:', hostel.name);
// //         console.log('Hostel Owner ID:', hostel.owner_id);
// //         console.log('Current User ID:', req.userId);

// //         if (hostel.owner_id !== req.userId) {
// //             console.log('❌ Unauthorized - User does not own this hostel');
// //             return res.status(403).json({
// //                 success: false,
// //                 message: 'Unauthorized to add rooms to this hostel'
// //             });
// //         }

// //         const { name, description, capacity, price_per_night, total_rooms, amenities } = req.body;

// //         // Validate required fields
// //         if (!name || !price_per_night) {
// //             console.log('❌ Missing required fields');
// //             return res.status(400).json({
// //                 success: false,
// //                 message: 'Please provide name and price_per_night'
// //             });
// //         }

// //         // Handle amenities - it might be a string or array
// //         let amenitiesArray = [];
// //         if (amenities) {
// //             if (typeof amenities === 'string') {
// //                 // If it's a string, try to parse it
// //                 try {
// //                     amenitiesArray = JSON.parse(amenities);
// //                 } catch (e) {
// //                     // If it's a comma-separated string
// //                     amenitiesArray = amenities.split(',').map(item => item.trim());
// //                 }
// //             } else if (Array.isArray(amenities)) {
// //                 // If it's already an array
// //                 amenitiesArray = amenities;
// //             } else if (typeof amenities === 'object') {
// //                 amenitiesArray = Object.values(amenities);
// //             }
// //         }

// //         console.log('✅ Amenities array:', amenitiesArray);

// //         console.log('✅ Creating room type with:', {
// //             name,
// //             price_per_night,
// //             capacity,
// //             total_rooms,
// //             amenities: amenitiesArray
// //         });

// //         // Create room type
// //         const roomTypeId = await RoomType.create({
// //             hostel_id: parseInt(hostelId),
// //             name,
// //             description: description || '',
// //             capacity: capacity || 1,
// //             price_per_night: parseFloat(price_per_night),
// //             total_rooms: total_rooms || 0,
// //             amenities: amenitiesArray
// //         });

// //         console.log('✅ Room type created with ID:', roomTypeId);

// //         // Get the created room type
// //         const newRoomType = await RoomType.findById(roomTypeId);

// //         res.status(201).json({
// //             success: true,
// //             message: 'Room type added successfully',
// //             data: newRoomType
// //         });

// //     } catch (error) {
// //         console.error('❌ Add room type error:', error);
// //         console.error('Stack:', error.stack);
// //         res.status(500).json({
// //             success: false,
// //             message: 'Server error',
// //             error: process.env.NODE_ENV === 'development' ? error.message : undefined
// //         });
// //     }
// // };



// const Hostel = require('../models/Hostel');
// const RoomType = require('../models/RoomType');
// const pool = require('../config/database');

// // @desc    Create hostel
// // @route   POST /api/hostels
// // @access  Private (Owner only)
// exports.createHostel = async (req, res) => {
//     try {
//         console.log('========================================');
//         console.log('📝 CREATE HOSTEL');
//         console.log('========================================');
//         console.log('User ID:', req.userId);
//         console.log('Body:', req.body);
//         console.log('Files:', req.files ? req.files.length : 'No files');

//         const {
//             name,
//             property_type,
//             description,
//             address,
//             city,
//             state,
//             country,
//             latitude,
//             longitude,
//             total_rooms,
//             amenities,
//             room_types,
//             check_in_time,
//             check_out_time,
//             cancellation_policy,
//             min_stay_days
//         } = req.body;

//         // Validate required fields
//         if (!name || !address || !city) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Please provide name, address, and city'
//             });
//         }

//         // Check if user is approved owner
//         if (req.userRole !== 'owner') {
//             return res.status(403).json({
//                 success: false,
//                 message: 'Only approved owners can create hostels'
//             });
//         }

//         // Parse amenities and room_types
//         let parsedAmenities = [];
//         let parsedRoomTypes = [];
//         try {
//             if (amenities) parsedAmenities = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
//             if (room_types) parsedRoomTypes = typeof room_types === 'string' ? JSON.parse(room_types) : room_types;
//         } catch (e) {
//             console.log('Error parsing JSON:', e.message);
//         }

//         // Create hostel
//         console.log('📝 Creating hostel in database...');
//         const hostelId = await Hostel.create({
//             owner_id: req.userId,
//             name,
//             property_type: property_type || 'hostel',
//             description: description || '',
//             address,
//             city,
//             state: state || '',
//             country: country || 'Pakistan',
//             latitude: latitude || null,
//             longitude: longitude || null,
//             total_rooms: total_rooms || 0,
//             amenities: parsedAmenities,
//             room_types: parsedRoomTypes,
//             check_in_time: check_in_time || '14:00:00',
//             check_out_time: check_out_time || '12:00:00',
//             cancellation_policy: cancellation_policy || 'moderate',
//             min_stay_days: min_stay_days || 1
//         });

//         console.log('✅ Hostel created with ID:', hostelId);

//         // Handle photo uploads
//         if (req.files && req.files.length > 0) {
//             console.log(`📸 Saving ${req.files.length} photos...`);
            
//             const photoQueries = req.files.map((file, index) => {
//                 const isPrimary = index === 0;
//                 const is360 = false;
//                 console.log(`  Photo ${index + 1}: ${file.path} (Primary: ${isPrimary})`);
                
//                 return pool.execute(
//                     'INSERT INTO hostel_photos (hostel_id, photo_url, is_primary, is_360, sort_order) VALUES (?, ?, ?, ?, ?)',
//                     [hostelId, file.path, isPrimary, is360, index]
//                 );
//             });
            
//             await Promise.all(photoQueries);
//             console.log('✅ Photos saved successfully');
//         } else {
//             console.log('⚠️ No photos uploaded');
//         }

//         // Get created hostel with photos
//         const [hostelRows] = await pool.execute('SELECT * FROM hostels WHERE id = ?', [hostelId]);
//         const [photoRows] = await pool.execute('SELECT * FROM hostel_photos WHERE hostel_id = ?', [hostelId]);

//         console.log('========================================');
//         console.log('✅ HOSTEL CREATED SUCCESSFULLY');
//         console.log(`  Hostel ID: ${hostelId}`);
//         console.log(`  Photos: ${photoRows.length}`);
//         console.log('========================================');

//         res.status(201).json({
//             success: true,
//             message: 'Hostel created successfully',
//             data: { 
//                 hostelId,
//                 hostel: hostelRows[0],
//                 photos: photoRows
//             }
//         });

//     } catch (error) {
//         console.error('❌ Create hostel error:', error);
//         console.error('Stack:', error.stack);
//         res.status(500).json({
//             success: false,
//             message: 'Server error',
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };

// // @desc    Get all hostels
// // @route   GET /api/hostels
// // @access  Public
// exports.getHostels = async (req, res) => {
//     try {
//         const { city, minPrice, maxPrice, search, limit = 20 } = req.query;

//         const hostels = await Hostel.findAll({
//             city,
//             minPrice,
//             maxPrice,
//             search,
//             limit: parseInt(limit)
//         });

//         res.json({
//             success: true,
//             count: hostels.length,
//             data: hostels
//         });

//     } catch (error) {
//         console.error('Get hostels error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error'
//         });
//     }
// };

// // @desc    Get single hostel
// // @route   GET /api/hostels/:id
// // @access  Public
// // @desc    Create hostel
// // @route   POST /api/hostels
// // @access  Private (Owner only)
// exports.createHostel = async (req, res) => {
//     try {
//         console.log('========================================');
//         console.log('📝 CREATE HOSTEL');
//         console.log('========================================');
//         console.log('User ID:', req.userId);
//         console.log('Body:', req.body);
//         console.log('Files:', req.files ? req.files.length : 'No files');

//         const {
//             name,
//             property_type,
//             description,
//             address,
//             city,
//             state,
//             country,
//             latitude,
//             longitude,
//             total_rooms,
//             amenities,
//             room_types,
//             check_in_time,
//             check_out_time,
//             cancellation_policy,
//             min_stay_days
//         } = req.body;

//         // Validate required fields
//         if (!name || !address || !city) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Please provide name, address, and city'
//             });
//         }

//         // Check if user is approved owner
//         if (req.userRole !== 'owner') {
//             return res.status(403).json({
//                 success: false,
//                 message: 'Only approved owners can create hostels'
//             });
//         }

//         // Parse amenities and room_types
//         let parsedAmenities = [];
//         let parsedRoomTypes = [];
//         try {
//             if (amenities) parsedAmenities = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
//             if (room_types) parsedRoomTypes = typeof room_types === 'string' ? JSON.parse(room_types) : room_types;
//         } catch (e) {
//             console.log('Error parsing JSON:', e.message);
//         }

//         // Create hostel
//         console.log('📝 Creating hostel in database...');
//         const hostelId = await Hostel.create({
//             owner_id: req.userId,
//             name,
//             property_type: property_type || 'hostel',
//             description: description || '',
//             address,
//             city,
//             state: state || '',
//             country: country || 'Pakistan',
//             latitude: latitude || null,
//             longitude: longitude || null,
//             total_rooms: total_rooms || 0,
//             amenities: parsedAmenities,
//             room_types: parsedRoomTypes,
//             check_in_time: check_in_time || '14:00:00',
//             check_out_time: check_out_time || '12:00:00',
//             cancellation_policy: cancellation_policy || 'moderate',
//             min_stay_days: min_stay_days || 1
//         });

//         console.log('✅ Hostel created with ID:', hostelId);

//         // Handle photo uploads
//         if (req.files && req.files.length > 0) {
//             console.log(`📸 Saving ${req.files.length} photos...`);
            
//             const photoQueries = req.files.map((file, index) => {
//                 const isPrimary = index === 0;
//                 console.log(`  Photo ${index + 1}: ${file.path} (Primary: ${isPrimary})`);
                
//                 // ✅ FIX: Remove is_360 column if it doesn't exist
//                 return pool.execute(
//                     'INSERT INTO hostel_photos (hostel_id, photo_url, is_primary, sort_order) VALUES (?, ?, ?, ?)',
//                     [hostelId, file.path, isPrimary, index]
//                 );
//             });
            
//             await Promise.all(photoQueries);
//             console.log('✅ Photos saved successfully');
//         } else {
//             console.log('⚠️ No photos uploaded');
//         }

//         // Get created hostel with photos
//         const [hostelRows] = await pool.execute('SELECT * FROM hostels WHERE id = ?', [hostelId]);
//         const [photoRows] = await pool.execute('SELECT * FROM hostel_photos WHERE hostel_id = ?', [hostelId]);

//         console.log('========================================');
//         console.log('✅ HOSTEL CREATED SUCCESSFULLY');
//         console.log(`  Hostel ID: ${hostelId}`);
//         console.log(`  Photos: ${photoRows.length}`);
//         console.log('========================================');

//         res.status(201).json({
//             success: true,
//             message: 'Hostel created successfully',
//             data: { 
//                 hostelId,
//                 hostel: hostelRows[0],
//                 photos: photoRows
//             }
//         });

//     } catch (error) {
//         console.error('❌ Create hostel error:', error);
//         console.error('Stack:', error.stack);
//         res.status(500).json({
//             success: false,
//             message: 'Server error',
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };
// exports.updateHostel = async (req, res) => {
//     try {
//         const hostelId = req.params.id;
//         console.log('========================================');
//         console.log('📝 UPDATE HOSTEL REQUEST');
//         console.log('========================================');
//         console.log('Hostel ID:', hostelId);
//         console.log('User ID from token:', req.userId);
//         console.log('User Role:', req.userRole);
//         console.log('Update Data:', req.body);
        
//         // Check if hostel exists
//         const hostel = await Hostel.findById(hostelId);
//         if (!hostel) {
//             console.log('❌ Hostel not found');
//             return res.status(404).json({
//                 success: false,
//                 message: 'Hostel not found'
//             });
//         }
        
//         console.log('✅ Hostel found:');
//         console.log('  Name:', hostel.name);
//         console.log('  Owner ID in DB:', hostel.owner_id);
//         console.log('  User ID from token:', req.userId);
        
//         // Check ownership
//         if (hostel.owner_id !== req.userId && req.userRole !== 'admin') {
//             console.log('❌ Authorization failed:');
//             console.log('  Hostel owner_id:', hostel.owner_id);
//             console.log('  Token user_id:', req.userId);
//             console.log('  User role:', req.userRole);
            
//             return res.status(403).json({
//                 success: false,
//                 message: 'Unauthorized to update this hostel',
//                 debug: {
//                     hostel_owner_id: hostel.owner_id,
//                     token_user_id: req.userId,
//                     user_role: req.userRole
//                 }
//             });
//         }

//         console.log('✅ Authorization passed');

//         // Update hostel
//         const updateResult = await Hostel.update(hostelId, req.body);
//         console.log('✅ Update result:', updateResult);

//         // Get updated hostel
//         const updatedHostel = await Hostel.findById(hostelId);

//         res.json({
//             success: true,
//             message: 'Hostel updated successfully',
//             data: updatedHostel
//         });

//     } catch (error) {
//         console.error('❌ Update hostel error:', error);
//         console.error('Stack:', error.stack);
//         res.status(500).json({
//             success: false,
//             message: 'Server error during update',
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };

// // @desc    Get owner's hostels
// // @route   GET /api/hostels/owner/hostels
// // @access  Private (Owner only)
// exports.getOwnerHostels = async (req, res) => {
//     try {
//         const hostels = await Hostel.findByOwner(req.userId);

//         res.json({
//             success: true,
//             count: hostels.length,
//             data: hostels
//         });

//     } catch (error) {
//         console.error('Get owner hostels error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error'
//         });
//     }
// };

// // @desc    Get room types for a hostel
// // @route   GET /api/hostels/:hostelId/rooms
// // @access  Public
// exports.getRoomTypes = async (req, res) => {
//     try {
//         const { hostelId } = req.params;
//         console.log('📝 Fetching room types for hostel:', hostelId);
        
//         // Check if hostel exists
//         const hostel = await Hostel.findById(hostelId);
//         if (!hostel) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Hostel not found'
//             });
//         }

//         // Get room types
//         const roomTypes = await RoomType.findByHostel(hostelId);
        
//         res.json({
//             success: true,
//             count: roomTypes.length,
//             data: roomTypes
//         });

//     } catch (error) {
//         console.error('❌ Get room types error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error',
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };

// // @desc    Add room type
// // @route   POST /api/hostels/:hostelId/rooms
// // @access  Private (Owner only)
// exports.addRoomType = async (req, res) => {
//     try {
//         const { hostelId } = req.params;
//         console.log('========================================');
//         console.log('🛏️ ADD ROOM TYPE');
//         console.log('========================================');
//         console.log('Hostel ID:', hostelId);
//         console.log('User ID:', req.userId);
//         console.log('Request Body:', req.body);
        
//         // Check if hostel exists and belongs to owner
//         const hostel = await Hostel.findById(hostelId);
//         if (!hostel) {
//             console.log('❌ Hostel not found');
//             return res.status(404).json({
//                 success: false,
//                 message: 'Hostel not found'
//             });
//         }

//         console.log('✅ Hostel found:', hostel.name);
//         console.log('Hostel Owner ID:', hostel.owner_id);
//         console.log('Current User ID:', req.userId);

//         if (hostel.owner_id !== req.userId) {
//             console.log('❌ Unauthorized - User does not own this hostel');
//             return res.status(403).json({
//                 success: false,
//                 message: 'Unauthorized to add rooms to this hostel'
//             });
//         }

//         const { name, description, capacity, price_per_night, total_rooms, amenities } = req.body;

//         // Validate required fields
//         if (!name || !price_per_night) {
//             console.log('❌ Missing required fields');
//             return res.status(400).json({
//                 success: false,
//                 message: 'Please provide name and price_per_night'
//             });
//         }

//         // Handle amenities - it might be a string or array
//         let amenitiesArray = [];
//         if (amenities) {
//             if (typeof amenities === 'string') {
//                 try {
//                     amenitiesArray = JSON.parse(amenities);
//                 } catch (e) {
//                     amenitiesArray = amenities.split(',').map(item => item.trim());
//                 }
//             } else if (Array.isArray(amenities)) {
//                 amenitiesArray = amenities;
//             } else if (typeof amenities === 'object') {
//                 amenitiesArray = Object.values(amenities);
//             }
//         }

//         console.log('✅ Amenities array:', amenitiesArray);

//         console.log('✅ Creating room type with:', {
//             name,
//             price_per_night,
//             capacity,
//             total_rooms,
//             amenities: amenitiesArray
//         });

//         // Create room type
//         const roomTypeId = await RoomType.create({
//             hostel_id: parseInt(hostelId),
//             name,
//             description: description || '',
//             capacity: capacity || 1,
//             price_per_night: parseFloat(price_per_night),
//             total_rooms: total_rooms || 0,
//             amenities: amenitiesArray
//         });

//         console.log('✅ Room type created with ID:', roomTypeId);

//         // Get the created room type
//         const newRoomType = await RoomType.findById(roomTypeId);

//         res.status(201).json({
//             success: true,
//             message: 'Room type added successfully',
//             data: newRoomType
//         });

//     } catch (error) {
//         console.error('❌ Add room type error:', error);
//         console.error('Stack:', error.stack);
//         res.status(500).json({
//             success: false,
//             message: 'Server error',
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };


const Hostel = require('../models/Hostel');
const RoomType = require('../models/RoomType');
const pool = require('../config/database');
const ItineraryAI = require('../services/itineraryAI');
const { normalizePhotoUrl } = Hostel;

// A photo is 360 when the matching is_360 flag (sent alongside `photos`,
// one per file in upload order) is truthy. Multer/express only give us an
// array when the field repeats more than once, so normalize to an array.
const parseIs360Flags = (raw) => {
    if (raw === undefined) return [];
    const arr = Array.isArray(raw) ? raw : [raw];
    return arr.map((v) => v === '1' || v === 'true' || v === true);
};

// @desc    Create hostel
// @route   POST /api/hostels
// @access  Private (Owner only)
exports.createHostel = async (req, res) => {
    try {
        console.log('========================================');
        console.log('📝 CREATE HOSTEL');
        console.log('========================================');
        console.log('User ID:', req.userId);
        console.log('Body:', req.body);
        console.log('Files:', req.files ? req.files.length : 'No files');

        const {
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
        } = req.body;

        // Validate required fields
        if (!name || !address || !city) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, address, and city'
            });
        }

        // Check if user is approved owner
        if (req.userRole !== 'owner') {
            return res.status(403).json({
                success: false,
                message: 'Only approved owners can create hostels'
            });
        }

        // Parse amenities and room_types
        let parsedAmenities = [];
        let parsedRoomTypes = [];
        try {
            if (amenities) parsedAmenities = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
            if (room_types) parsedRoomTypes = typeof room_types === 'string' ? JSON.parse(room_types) : room_types;
        } catch (e) {
            console.log('Error parsing JSON:', e.message);
        }

        // Create hostel
        console.log('📝 Creating hostel in database...');
        const hostelId = await Hostel.create({
            owner_id: req.userId,
            name,
            property_type: property_type || 'hostel',
            description: description || '',
            address,
            city,
            state: state || '',
            country: country || 'Pakistan',
            latitude: latitude || null,
            longitude: longitude || null,
            total_rooms: total_rooms || 0,
            amenities: parsedAmenities,
            room_types: parsedRoomTypes,
            check_in_time: check_in_time || '14:00:00',
            check_out_time: check_out_time || '12:00:00',
            cancellation_policy: cancellation_policy || 'moderate',
            min_stay_days: min_stay_days || 1
        });

        console.log('✅ Hostel created with ID:', hostelId);

        // Handle photo uploads
        if (req.files && req.files.length > 0) {
            console.log(`📸 Saving ${req.files.length} photos...`);

            const is360Flags = parseIs360Flags(req.body.is_360);

            const photoQueries = req.files.map((file, index) => {
                const isPrimary = index === 0;
                const is360 = is360Flags[index] || false;
                const photoUrl = normalizePhotoUrl(file.path);
                console.log(`  Photo ${index + 1}: ${photoUrl} (Primary: ${isPrimary}, 360: ${is360})`);

                return pool.execute(
                    'INSERT INTO hostel_photos (hostel_id, photo_url, is_primary, is_360, sort_order) VALUES (?, ?, ?, ?, ?)',
                    [hostelId, photoUrl, isPrimary, is360, index]
                );
            });

            await Promise.all(photoQueries);
            console.log('✅ Photos saved successfully');
        } else {
            console.log('⚠️ No photos uploaded');
        }

        // Get created hostel with photos
        const [hostelRows] = await pool.execute('SELECT * FROM hostels WHERE id = ?', [hostelId]);
        const [photoRows] = await pool.execute('SELECT * FROM hostel_photos WHERE hostel_id = ?', [hostelId]);
        photoRows.forEach((p) => { p.photo_url = normalizePhotoUrl(p.photo_url); });

        console.log('========================================');
        console.log('✅ HOSTEL CREATED SUCCESSFULLY');
        console.log(`  Hostel ID: ${hostelId}`);
        console.log(`  Photos: ${photoRows.length}`);
        console.log('========================================');

        res.status(201).json({
            success: true,
            message: 'Hostel created successfully',
            data: { 
                hostelId,
                hostel: hostelRows[0],
                photos: photoRows
            }
        });

    } catch (error) {
        console.error('❌ Create hostel error:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get all hostels
// @route   GET /api/hostels
// @access  Public
exports.getHostels = async (req, res) => {
    try {
        const { city, minPrice, maxPrice, search, limit = 20 } = req.query;

        const hostels = await Hostel.findAll({
            city,
            minPrice,
            maxPrice,
            search,
            limit: parseInt(limit)
        });

        res.json({
            success: true,
            count: hostels.length,
            data: hostels
        });

    } catch (error) {
        console.error('Get hostels error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get single hostel
// @route   GET /api/hostels/:id
// @access  Public
exports.getHostel = async (req, res) => {
    try {
        const hostelId = req.params.id;
        console.log('📝 Fetching hostel with ID:', hostelId);

        // First, check if hostel exists
        const hostel = await Hostel.findById(hostelId);
        if (!hostel) {
            return res.status(404).json({
                success: false,
                message: 'Hostel not found'
            });
        }

        console.log('✅ Hostel found:', hostel.name);

        // Get photos separately
        let photos = [];
        try {
            const photoQuery = 'SELECT id, photo_url, is_primary, is_360, sort_order FROM hostel_photos WHERE hostel_id = ? ORDER BY is_primary DESC, sort_order ASC';
            const [photoRows] = await pool.execute(photoQuery, [hostelId]);
            photos = photoRows.map((p) => ({ ...p, photo_url: normalizePhotoUrl(p.photo_url) }));
            console.log(`📸 Found ${photos.length} photos`);
        } catch (error) {
            console.error('Error fetching photos:', error.message);
        }

        // Get room types
        let roomTypes = [];
        try {
            const roomQuery = 'SELECT * FROM room_types WHERE hostel_id = ? AND is_active = TRUE';
            const [roomRows] = await pool.execute(roomQuery, [hostelId]);
            roomTypes = roomRows;
            console.log(`🛏️ Found ${roomTypes.length} room types`);
        } catch (error) {
            console.error('Error fetching room types:', error.message);
        }

        // Get owner name
        let ownerName = '';
        try {
            const ownerQuery = 'SELECT full_name FROM users WHERE id = ?';
            const [ownerRows] = await pool.execute(ownerQuery, [hostel.owner_id]);
            if (ownerRows.length > 0) {
                ownerName = ownerRows[0].full_name;
            }
        } catch (error) {
            console.error('Error fetching owner:', error.message);
        }

        // Combine all data
        const hostelData = {
            ...hostel,
            owner_name: ownerName,
            photos: photos,
            room_types: roomTypes
        };

        res.json({
            success: true,
            data: hostelData
        });

    } catch (error) {
        console.error('❌ Get hostel error:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Update hostel
// @route   PUT /api/hostels/:id
// @access  Private (Owner only)
exports.updateHostel = async (req, res) => {
    try {
        const hostelId = req.params.id;
        console.log('========================================');
        console.log('📝 UPDATE HOSTEL REQUEST');
        console.log('========================================');
        console.log('Hostel ID:', hostelId);
        console.log('User ID from token:', req.userId);
        console.log('User Role:', req.userRole);
        console.log('Update Data:', req.body);
        
        // Check if hostel exists
        const hostel = await Hostel.findById(hostelId);
        if (!hostel) {
            console.log('❌ Hostel not found');
            return res.status(404).json({
                success: false,
                message: 'Hostel not found'
            });
        }
        
        console.log('✅ Hostel found:');
        console.log('  Name:', hostel.name);
        console.log('  Owner ID in DB:', hostel.owner_id);
        console.log('  User ID from token:', req.userId);
        
        // Check ownership
        if (hostel.owner_id !== req.userId && req.userRole !== 'admin') {
            console.log('❌ Authorization failed:');
            console.log('  Hostel owner_id:', hostel.owner_id);
            console.log('  Token user_id:', req.userId);
            console.log('  User role:', req.userRole);
            
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to update this hostel',
                debug: {
                    hostel_owner_id: hostel.owner_id,
                    token_user_id: req.userId,
                    user_role: req.userRole
                }
            });
        }

        console.log('✅ Authorization passed');

        // Update hostel
        const updateResult = await Hostel.update(hostelId, req.body);
        console.log('✅ Update result:', updateResult);

        // Get updated hostel
        const updatedHostel = await Hostel.findById(hostelId);

        res.json({
            success: true,
            message: 'Hostel updated successfully',
            data: updatedHostel
        });

    } catch (error) {
        console.error('❌ Update hostel error:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Server error during update',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get owner's hostels
// @route   GET /api/hostels/owner/hostels
// @access  Private (Owner only)
exports.getOwnerHostels = async (req, res) => {
    try {
        const hostels = await Hostel.findByOwner(req.userId);

        res.json({
            success: true,
            count: hostels.length,
            data: hostels
        });

    } catch (error) {
        console.error('Get owner hostels error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get an AI-generated list of nearby attractions + itinerary for a hostel
// @route   GET /api/hostels/:id/itinerary
// @access  Public
exports.getHostelItinerary = async (req, res) => {
    try {
        const hostelId = req.params.id;
        const durationDays = Math.min(Math.max(parseInt(req.query.duration_days) || 3, 1), 14);
        const interests = (req.query.interests || '').toString().slice(0, 255);

        const hostel = await Hostel.findById(hostelId);
        if (!hostel) {
            return res.status(404).json({ success: false, message: 'Hostel not found' });
        }

        const itinerary = await ItineraryAI.getItinerary(hostel, durationDays, interests);

        res.json({ success: true, data: itinerary });
    } catch (error) {
        console.error('❌ Get hostel itinerary error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get room types for a hostel
// @route   GET /api/hostels/:hostelId/rooms
// @access  Public
exports.getRoomTypes = async (req, res) => {
    try {
        const { hostelId } = req.params;
        console.log('📝 Fetching room types for hostel:', hostelId);
        
        // Check if hostel exists
        const hostel = await Hostel.findById(hostelId);
        if (!hostel) {
            return res.status(404).json({
                success: false,
                message: 'Hostel not found'
            });
        }

        // Get room types
        const roomTypes = await RoomType.findByHostel(hostelId);
        
        res.json({
            success: true,
            count: roomTypes.length,
            data: roomTypes
        });

    } catch (error) {
        console.error('❌ Get room types error:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Add room type
// @route   POST /api/hostels/:hostelId/rooms
// @access  Private (Owner only)
exports.addRoomType = async (req, res) => {
    try {
        const { hostelId } = req.params;
        console.log('========================================');
        console.log('🛏️ ADD ROOM TYPE');
        console.log('========================================');
        console.log('Hostel ID:', hostelId);
        console.log('User ID:', req.userId);
        console.log('Request Body:', req.body);
        
        // Check if hostel exists and belongs to owner
        const hostel = await Hostel.findById(hostelId);
        if (!hostel) {
            console.log('❌ Hostel not found');
            return res.status(404).json({
                success: false,
                message: 'Hostel not found'
            });
        }

        console.log('✅ Hostel found:', hostel.name);
        console.log('Hostel Owner ID:', hostel.owner_id);
        console.log('Current User ID:', req.userId);

        if (hostel.owner_id !== req.userId) {
            console.log('❌ Unauthorized - User does not own this hostel');
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to add rooms to this hostel'
            });
        }

        const { name, description, capacity, price_per_night, total_rooms, amenities } = req.body;

        // Validate required fields
        if (!name || !price_per_night) {
            console.log('❌ Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Please provide name and price_per_night'
            });
        }

        // Handle amenities - it might be a string or array
        let amenitiesArray = [];
        if (amenities) {
            if (typeof amenities === 'string') {
                try {
                    amenitiesArray = JSON.parse(amenities);
                } catch (e) {
                    amenitiesArray = amenities.split(',').map(item => item.trim());
                }
            } else if (Array.isArray(amenities)) {
                amenitiesArray = amenities;
            } else if (typeof amenities === 'object') {
                amenitiesArray = Object.values(amenities);
            }
        }

        console.log('✅ Amenities array:', amenitiesArray);

        console.log('✅ Creating room type with:', {
            name,
            price_per_night,
            capacity,
            total_rooms,
            amenities: amenitiesArray
        });

        // Create room type
        const roomTypeId = await RoomType.create({
            hostel_id: parseInt(hostelId),
            name,
            description: description || '',
            capacity: capacity || 1,
            price_per_night: parseFloat(price_per_night),
            total_rooms: total_rooms || 0,
            amenities: amenitiesArray
        });

        console.log('✅ Room type created with ID:', roomTypeId);

        // Get the created room type
        const newRoomType = await RoomType.findById(roomTypeId);

        res.status(201).json({
            success: true,
            message: 'Room type added successfully',
            data: newRoomType
        });

    } catch (error) {
        console.error('❌ Add room type error:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};