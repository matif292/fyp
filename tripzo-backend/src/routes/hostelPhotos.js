// routes/hostelPhotos.js
const express = require('express');
const router = express.Router();
const { uploadHostelPhotos } = require('../middleware/upload');
const db = require('../config/database');

// Upload hostel photos
router.post('/hostel/:id/photos', uploadHostelPhotos, async (req, res) => {
    try {
        const hostelId = req.params.id;
        const files = req.files;
        
        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const uploadedPhotos = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Store ONLY the filename in database
            // The file is already saved by multer as: uploads/hostel/filename
            const photoData = {
                hostel_id: hostelId,
                photo_url: file.filename, // Just the filename
                is_primary: i === 0 ? 1 : 0, // First photo is primary
                sort_order: i,
                created_at: new Date(),
                is_360: 0
            };

            const [result] = await db.query(
                'INSERT INTO hostel_photos SET ?',
                [photoData]
            );

            uploadedPhotos.push({
                id: result.insertId,
                photo_url: `/uploads/hostel/${file.filename}` // Full URL for response
            });
        }

        res.status(201).json({
            success: true,
            message: `${files.length} photos uploaded successfully`,
            photos: uploadedPhotos
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload photos' });
    }
});

// Get hostel photos
router.get('/hostel/:id/photos', async (req, res) => {
    try {
        const [photos] = await db.query(
            'SELECT * FROM hostel_photos WHERE hostel_id = ? ORDER BY sort_order',
            [req.params.id]
        );

        const processedPhotos = photos.map(photo => ({
            ...photo,
            photo_url: `/uploads/hostel/${photo.photo_url}`
        }));

        res.json(processedPhotos);
    } catch (error) {
        console.error('Error fetching photos:', error);
        res.status(500).json({ error: 'Failed to fetch photos' });
    }
});

module.exports = router;