import client from './client';

export const addReview = (payload) => client.post('/reviews', payload);

export const getHostelReviews = (hostelId) => client.get(`/reviews/hostel/${hostelId}`);

export const getHostelSentiment = (hostelId) => client.get(`/reviews/hostel/${hostelId}/sentiment`);

export const getMyReviews = () => client.get('/reviews/my-reviews');

export const getReview = (id) => client.get(`/reviews/${id}`);

export const updateReview = (reviewId, payload) => client.put(`/reviews/${reviewId}`, payload);

export const deleteReview = (reviewId) => client.delete(`/reviews/${reviewId}`);
