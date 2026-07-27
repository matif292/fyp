import client from './client';

// Create a new booking (Traveler)
export const createBooking = (payload) => client.post('/bookings', payload);

// Get my bookings (Traveler)
export const getMyBookings = () => client.get('/bookings/my-bookings');

// Get bookings for a specific hostel (Owner)
export const getHostelBookings = (hostelId) => client.get(`/bookings/hostel/${hostelId}`);

// Get single booking by ID
export const getBooking = (id) => client.get(`/bookings/${id}`);

// Update booking status (Owner/Admin)
export const updateBookingStatus = (bookingId, status) =>
  client.put(`/bookings/${bookingId}/status`, { status });

// Cancel booking (Traveler)
export const cancelBooking = (bookingId) => client.put(`/bookings/${bookingId}/cancel`);

// Update payment status (Owner/Admin)
export const updatePaymentStatus = (bookingId, payment_status) =>
  client.put(`/bookings/${bookingId}/payment`, { payment_status });