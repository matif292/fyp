// controllers/hostelPhotoController.js
const db = require('../config/database');
const path = require('path');
const fs = require('fs');

// Helper function to clean photo URL
const cleanPhotoUrl = (photoUrl) => {
    if (!photoUrl) return null;
    
    // If it's a Windows path
    if (photoUrl.includes('C:\\') || photoUrl.includes('\\')) {
        const filename = photoUrl.split('\\').pop();
        return `/uploads/hostel/${filename}`;
    }
    
    // If it starts with 'uploads/' (without slash)
    if (photoUrl.startsWith('uploads/')) {
        return `/${photoUrl}`;
    }
    
    // If it already starts with /uploads, return as is
    if (photoUrl.startsWith('/uploads')) {
        return photoUrl;
    }
    
    // Default: treat as filename
    return `/uploads/hostel/${photoUrl}`;
};

// Get all photos for a hostel
exports.getHostelPhotos = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [photos] = await db.query(
            'SELECT * FROM hostel_photos WHERE hostel_id = ? ORDER BY sort_order',
            [id]
        );

        const processedPhotos = photos.map(photo => ({
            ...photo,
            photo_url: cleanPhotoUrl(photo.photo_url)
        }));

        res.json(processedPhotos);
    } catch (error) {
        console.error('Error fetching photos:', error);
        res.status(500).json({ error: 'Failed to fetch photos' });
    }
};

// Upload photos
exports.uploadHostelPhotos = async (req, res) => {
    try {
        const { id } = req.params;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const uploadedPhotos = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Store filename only
            const [result] = await db.query(
                `INSERT INTO hostel_photos 
                (hostel_id, photo_url, is_primary, sort_order, created_at) 
                VALUES (?, ?, ?, ?, NOW())`,
                [id, file.filename, i === 0 ? 1 : 0, i]
            );

            uploadedPhotos.push({
                id: result.insertId,
                photo_url: `/uploads/hostel/${file.filename}`,
                is_primary: i === 0 ? 1 : 0,
                sort_order: i
            });
        }

        res.status(201).json({
            success: true,
            message: `${files.length} photos uploaded`,
            photos: uploadedPhotos
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload photos' });
    }
};