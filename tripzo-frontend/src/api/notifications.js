import client from './client';

export const getOwnerNotifications = (unreadOnly = false) =>
  client.get('/notifications', { params: unreadOnly ? { unread: 'true' } : {} });

export const getUnreadCount = () => client.get('/notifications/unread-count');

export const markNotificationRead = (id) => client.put(`/notifications/${id}/read`);

export const markAllNotificationsRead = () => client.put('/notifications/read-all');
