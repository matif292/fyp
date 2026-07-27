import client from './client';

export const sendChatMessage = (message) => client.post('/chatbot/message', { message });
export const getChatHistory = () => client.get('/chatbot/history');
export const clearChat = () => client.delete('/chatbot/history');
