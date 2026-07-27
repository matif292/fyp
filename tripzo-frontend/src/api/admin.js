import client from './client';

export const getAdminStats = () => client.get('/admin/stats');

export const getPendingApprovals = () => client.get('/admin/pending-approvals');

export const approveOwner = (userId) => client.put(`/admin/approve-owner/${userId}`);

export const rejectOwner = (userId, reason) =>
  client.put(`/admin/reject-owner/${userId}`, { reason });

export const getAllUsers = () => client.get('/admin/users');

export const toggleUserStatus = (userId, is_active) =>
  client.put(`/admin/users/${userId}/toggle-status`, { is_active });

export const getSentimentOverview = () => client.get('/admin/sentiment-overview');

export const getAllHostels = () => client.get('/admin/hostels');

export const toggleHostelStatus = (hostelId) =>
  client.put(`/admin/hostels/${hostelId}/toggle-status`);

export const getSettings = () => client.get('/admin/settings');

export const updateSettings = (data) => client.put('/admin/settings', data);
