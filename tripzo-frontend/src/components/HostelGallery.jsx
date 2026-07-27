// components/HostelGallery.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000'; // Your backend URL

const HostelGallery = ({ hostelId }) => {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (hostelId) {
            fetchPhotos();
        }
    }, [hostelId]);

    const fetchPhotos = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/hostel/${hostelId}/photos`);
            setPhotos(response.data);
        } catch (error) {
            console.error('Error fetching photos:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    if (photos.length === 0) {
        return <div>No photos available</div>;
    }

    return (
        <div className="gallery">
            {photos.map((photo) => (
                <div key={photo.id} className="photo-card">
                    <img
                        src={`${API_BASE_URL}${photo.photo_url}`}
                        alt={`Hostel photo ${photo.sort_order + 1}`}
                        onError={(e) => {
                            e.target.src = '/no-image-available.png';
                            e.target.alt = 'Image not found';
                        }}
                        className={photo.is_primary ? 'primary-photo' : ''}
                    />
                    {photo.is_primary && <span className="badge">Primary</span>}
                </div>
            ))}
        </div>
    );
};

export default HostelGallery;