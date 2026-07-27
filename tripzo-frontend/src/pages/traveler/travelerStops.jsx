import { Map, Star, User, HeartHandshake, Bell } from 'lucide-react';

export const travelerStops = [
  { to: '/account/bookings', label: 'My bookings', icon: <Map size={15} /> },
  { to: '/account/negotiations', label: 'My offers', icon: <HeartHandshake size={15} /> },
  { to: '/account/waiting-list', label: 'Waiting list', icon: <Bell size={15} /> },
  { to: '/account/reviews', label: 'My reviews', icon: <Star size={15} /> },
  { to: '/account/profile', label: 'Profile', icon: <User size={15} /> },
];
