import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyBookings, getHostelBookings, createBooking, cancelBooking, updateBookingStatus } from '../api/bookings';
import toast from 'react-hot-toast';

export const useMyBookings = () => {
  return useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const { data } = await getMyBookings();
      return data.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useHostelBookings = (hostelId) => {
  return useQuery({
    queryKey: ['hostel-bookings', hostelId],
    queryFn: async () => {
      if (!hostelId) return [];
      const { data } = await getHostelBookings(hostelId);
      return data.data || [];
    },
    enabled: !!hostelId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingData) => createBooking(bookingData),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['my-bookings']);
      toast.success('Booking created successfully!');
      return data;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create booking');
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId) => cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-bookings']);
      toast.success('Booking cancelled successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    },
  });
};

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, status }) => updateBookingStatus(bookingId, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['hostel-bookings']);
      toast.success(`Booking status updated to ${variables.status}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update booking status');
    },
  });
};