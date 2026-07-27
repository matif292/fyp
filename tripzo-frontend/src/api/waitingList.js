import client from './client';

export const joinWaitingList = (payload) => client.post('/waiting-list', payload);
export const getMyWaitingList = () => client.get('/waiting-list');
export const removeFromWaitingList = (id) => client.delete(`/waiting-list/${id}`);
