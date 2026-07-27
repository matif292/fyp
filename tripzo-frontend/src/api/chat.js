import client from './client';

export const getConversations = () => client.get('/chat/conversations');
export const getMessages = (conversationId, limit = 50) => 
  client.get(`/chat/conversations/${conversationId}/messages`, { params: { limit } });
export const sendMessage = (conversationId, data) => 
  client.post(`/chat/conversations/${conversationId}/messages`, data);
export const startConversation = (userId) => 
  client.post('/chat/conversations', { user_id: userId });
export const markAsRead = (conversationId) => 
  client.put(`/chat/conversations/${conversationId}/read`);