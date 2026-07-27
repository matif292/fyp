// // // import { BrowserRouter, Routes, Route } from 'react-router-dom';
// // // import { AuthProvider } from './context/AuthContext';
// // // import ProtectedRoute from './components/ProtectedRoute';

// // // import Landing from './pages/Landing';
// // // import Login from './pages/Login';
// // // import Register from './pages/Register';
// // // import RegisterOwner from './pages/RegisterOwner';
// // // import VerifyOtp from './pages/VerifyOtp';
// // // import Hostels from './pages/Hostels';
// // // import HostelDetail from './pages/HostelDetail';
// // // import NotFound from './pages/NotFound';

// // // import MyBookings from './pages/traveler/MyBookings';
// // // import MyReviews from './pages/traveler/MyReviews';
// // // import Profile from './pages/traveler/Profile';

// // // import OwnerDashboard from './pages/owner/OwnerDashboard';
// // // import OwnerHostels from './pages/owner/OwnerHostels';
// // // import CreateHostel from './pages/owner/CreateHostel';
// // // import HostelRoomsManage from './pages/owner/HostelRoomsManage';
// // // import HostelBookings from './pages/owner/HostelBookings';

// // // import AdminDashboard from './pages/admin/AdminDashboard';
// // // import PendingApprovals from './pages/admin/PendingApprovals';
// // // import AllUsers from './pages/admin/AllUsers';

// // // export default function App() {
// // //   return (
// // //     <BrowserRouter>
// // //       <AuthProvider>
// // //         <Routes>
// // //           {/* Public */}
// // //           <Route path="/" element={<Landing />} />
// // //           <Route path="/hostels" element={<Hostels />} />
// // //           <Route path="/hostels/:id" element={<HostelDetail />} />
// // //           <Route path="/login" element={<Login />} />
// // //           <Route path="/register" element={<Register />} />
// // //           <Route path="/register-owner" element={<RegisterOwner />} />
// // //           <Route path="/verify-otp" element={<VerifyOtp />} />

// // //           {/* Traveler */}
// // //           <Route
// // //             path="/account/bookings"
// // //             element={
// // //               <ProtectedRoute roles={['traveler']}>
// // //                 <MyBookings />
// // //               </ProtectedRoute>
// // //             }
// // //           />
// // //           <Route
// // //             path="/account/reviews"
// // //             element={
// // //               <ProtectedRoute roles={['traveler']}>
// // //                 <MyReviews />
// // //               </ProtectedRoute>
// // //             }
// // //           />
// // //           <Route
// // //             path="/account/profile"
// // //             element={
// // //               <ProtectedRoute roles={['traveler']}>
// // //                 <Profile />
// // //               </ProtectedRoute>
// // //             }
// // //           />

// // //           {/* Owner */}
// // //           <Route
// // //             path="/owner"
// // //             element={
// // //               <ProtectedRoute roles={['owner']}>
// // //                 <OwnerDashboard />
// // //               </ProtectedRoute>
// // //             }
// // //           />
// // //           <Route
// // //             path="/owner/hostels"
// // //             element={
// // //               <ProtectedRoute roles={['owner']}>
// // //                 <OwnerHostels />
// // //               </ProtectedRoute>
// // //             }
// // //           />
// // //           <Route
// // //             path="/owner/hostels/new"
// // //             element={
// // //               <ProtectedRoute roles={['owner']}>
// // //                 <CreateHostel />
// // //               </ProtectedRoute>
// // //             }
// // //           />
// // //           <Route
// // //             path="/owner/hostels/:hostelId/rooms"
// // //             element={
// // //               <ProtectedRoute roles={['owner']}>
// // //                 <HostelRoomsManage />
// // //               </ProtectedRoute>
// // //             }
// // //           />
// // //           <Route
// // //             path="/owner/hostels/:hostelId/bookings"
// // //             element={
// // //               <ProtectedRoute roles={['owner']}>
// // //                 <HostelBookings />
// // //               </ProtectedRoute>
// // //             }
// // //           />

// // //           {/* Admin */}
// // //           <Route
// // //             path="/admin"
// // //             element={
// // //               <ProtectedRoute roles={['admin']}>
// // //                 <AdminDashboard />
// // //               </ProtectedRoute>
// // //             }
// // //           />
// // //           <Route
// // //             path="/admin/approvals"
// // //             element={
// // //               <ProtectedRoute roles={['admin']}>
// // //                 <PendingApprovals />
// // //               </ProtectedRoute>
// // //             }
// // //           />
// // //           <Route
// // //             path="/admin/users"
// // //             element={
// // //               <ProtectedRoute roles={['admin']}>
// // //                 <AllUsers />
// // //               </ProtectedRoute>
// // //             }
// // //           />

// // //           <Route path="*" element={<NotFound />} />
// // //         </Routes>
// // //       </AuthProvider>
// // //     </BrowserRouter>
// // //   );
// // // }



import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ChatbotWidget from './components/ChatbotWidget';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterOwner from './pages/RegisterOwner';
import VerifyOtp from './pages/VerifyOtp';
import Hostels from './pages/Hostels';
import HostelDetail from './pages/HostelDetail';
import NotFound from './pages/NotFound';

// NEW: Trip Planner
import TripPlanner from './pages/TripPlanner';

// Traveler Pages
import MyBookings from './pages/traveler/MyBookings';
import MyReviews from './pages/traveler/MyReviews';
import MyNegotiations from './pages/traveler/MyNegotiations';
import MyWaitingList from './pages/traveler/MyWaitingList';
import Profile from './pages/traveler/Profile';

// Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerHostels from './pages/owner/OwnerHostels';
import CreateHostel from './pages/owner/CreateHostel';
import HostelRoomsManage from './pages/owner/HostelRoomsManage';
import HostelBookings from './pages/owner/HostelBookings';
import OwnerNegotiations from './pages/owner/OwnerNegotiations';
import OwnerNotifications from './pages/owner/OwnerNotifications';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import PendingApprovals from './pages/admin/PendingApprovals';
import AllUsers from './pages/admin/AllUsers';
import AdminHostels from './pages/admin/AdminHostels';
import AdminSettings from './pages/admin/AdminSettings';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/hostels" element={<Hostels />} />
          <Route path="/hostels/:id" element={<HostelDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-owner" element={<RegisterOwner />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          
          {/* NEW: Trip Planner - Public but with auth features */}
          <Route path="/trips" element={<TripPlanner />} />

          {/* Traveler Routes */}
          <Route
            path="/account/bookings"
            element={
              <ProtectedRoute roles={['traveler']}>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/reviews"
            element={
              <ProtectedRoute roles={['traveler']}>
                <MyReviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/negotiations"
            element={
              <ProtectedRoute roles={['traveler']}>
                <MyNegotiations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/waiting-list"
            element={
              <ProtectedRoute roles={['traveler']}>
                <MyWaitingList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/profile"
            element={
              <ProtectedRoute roles={['traveler']}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Owner Routes */}
          <Route
            path="/owner"
            element={
              <ProtectedRoute roles={['owner']}>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/hostels"
            element={
              <ProtectedRoute roles={['owner']}>
                <OwnerHostels />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/hostels/new"
            element={
              <ProtectedRoute roles={['owner']}>
                <CreateHostel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/hostels/:hostelId/rooms"
            element={
              <ProtectedRoute roles={['owner']}>
                <HostelRoomsManage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/hostels/:hostelId/bookings"
            element={
              <ProtectedRoute roles={['owner']}>
                <HostelBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/negotiations"
            element={
              <ProtectedRoute roles={['owner']}>
                <OwnerNegotiations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/notifications"
            element={
              <ProtectedRoute roles={['owner']}>
                <OwnerNotifications />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/approvals"
            element={
              <ProtectedRoute roles={['admin']}>
                <PendingApprovals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={['admin']}>
                <AllUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/hostels"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminHostels />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminSettings />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
        <ChatbotWidget />
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}


