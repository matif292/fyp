import client from './client';

// Get all hostels with filters
export const getHostels = (params = {}) => client.get('/hostels', { params });

// Get single hostel by ID
export const getHostel = (id) => client.get(`/hostels/${id}`);

// Create hostel (Owner only)
export const createHostel = (formData) =>
  client.post('/hostels', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// Update hostel (Owner only)
export const updateHostel = (id, payload) => client.put(`/hostels/${id}`, payload);

// Get owner's hostels (Owner only)
export const getOwnerHostels = () => client.get('/hostels/owner/hostels');

// Get room types for a hostel
export const getRoomTypes = (hostelId) => client.get(`/hostels/${hostelId}/rooms`);

// Get an AI-generated list of nearby attractions + itinerary for a hostel
export const getHostelItinerary = (hostelId, durationDays = 3, interests = '') =>
  client.get(`/hostels/${hostelId}/itinerary`, { params: { duration_days: durationDays, interests } });

// Add room type (Owner only)
export const addRoomType = (hostelId, payload) => client.post(`/hostels/${hostelId}/rooms`, payload);

// Delete hostel (Owner only)
export const deleteHostel = (id) => client.delete(`/hostels/${id}`);

// Search hostels
export const searchHostels = (query) => client.get('/hostels/search', { params: query });