import client from './client';

// Traveler
export const sendNegotiation = (payload) => client.post('/negotiations', payload);
export const getMyNegotiations = () => client.get('/negotiations/my');
export const acceptCounter = (id) => client.post(`/negotiations/${id}/accept-counter`);

// Owner
export const getOwnerNegotiations = () => client.get('/negotiations/hostel-owner');
export const respondToNegotiation = (id, payload) => client.put(`/negotiations/${id}/respond`, payload);
export const getNegotiationRules = (hostelId) => client.get(`/negotiations/hostel/${hostelId}/rules`);
export const updateNegotiationRules = (hostelId, payload) => client.put(`/negotiations/hostel/${hostelId}/rules`, payload);
