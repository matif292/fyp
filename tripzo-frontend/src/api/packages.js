import client from './client';

export const getHostelPackages = (hostelId) => 
  client.get(`/packages/hostel/${hostelId}`);
export const createPackage = (data) => client.post('/packages', data);
export const bookPackage = (packageId, data) => 
  client.post(`/packages/${packageId}/book`, data);
export const getPackageBookings = (hostelId) => 
  client.get(`/packages/bookings/hostel/${hostelId}`);