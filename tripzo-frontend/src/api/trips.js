import client from './client';

export const createTripPlan = (data) => client.post('/trips', data);
export const getTripPlans = (params) => client.get('/trips', { params });
export const getTripPlan = (id) => client.get(`/trips/${id}`);
export const agreeToTrip = (planId) => client.post(`/trips/${planId}/agree`);
export const declineTrip = (planId) => client.post(`/trips/${planId}/decline`);
export const getTripGroups = () => client.get('/trips/groups');
export const addTripMemory = (groupId, data) =>
  client.post(`/trips/groups/${groupId}/memories`, data);
export const getTripMemories = (groupId) =>
  client.get(`/trips/groups/${groupId}/memories`);

export const getMyTripStatuses = () => client.get('/trips/my-statuses');
export const getJoinRequests = (planId) => client.get(`/trips/${planId}/join-requests`);
export const approveJoinRequest = (planId, userId) =>
  client.put(`/trips/${planId}/join-requests/${userId}/approve`);
export const rejectJoinRequest = (planId, userId) =>
  client.put(`/trips/${planId}/join-requests/${userId}/reject`);
export const leaveTripGroup = (groupId) => client.post(`/trips/groups/${groupId}/leave`);