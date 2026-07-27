import client from './client';

export const registerTraveler = (payload) => client.post('/auth/register', payload);

export const registerOwner = (formData) =>
  client.post('/auth/register-owner', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const verifyOtp = (payload) => client.post('/auth/verify-otp', payload);

export const login = (payload) => client.post('/auth/login', payload);

export const resendOtp = (payload) => client.post('/auth/resend-otp', payload);

export const getMe = () => client.get('/auth/me');
