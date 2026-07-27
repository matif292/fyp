// import { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import DashboardLayout from '../../components/DashboardLayout';
// import { Loader, EmptyState, Alert } from '../../components/Feedback';
// import StatusStamp from '../../components/StatusStamp';
// import { ownerStops } from './OwnerDashboard';
// import { getHostelBookings, updateBookingStatus, updatePaymentStatus } from '../../api/bookings';
// import { apiErrorMessage } from '../../api/client';

// const STATUS_OPTIONS = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'];
// const PAYMENT_OPTIONS = ['pending', 'paid', 'refunded'];

// export default function HostelBookings() {
//   const { hostelId } = useParams();
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [busyId, setBusyId] = useState(null);
//   const [actionError, setActionError] = useState('');

//   const load = async () => {
//     setLoading(true);
//     try {
//       const { data } = await getHostelBookings(hostelId);
//       setBookings(data.data || []);
//     } catch (err) {
//       setError(apiErrorMessage(err, 'Could not load bookings for this property.'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [hostelId]);

//   const changeStatus = async (bookingId, status) => {
//     setBusyId(bookingId);
//     setActionError('');
//     try {
//       await updateBookingStatus(bookingId, status);
//       load();
//     } catch (err) {
//       setActionError(apiErrorMessage(err, 'Could not update booking status.'));
//     } finally {
//       setBusyId(null);
//     }
//   };

//   const changePayment = async (bookingId, payment_status) => {
//     setBusyId(bookingId);
//     setActionError('');
//     try {
//       await updatePaymentStatus(bookingId, payment_status);
//       load();
//     } catch (err) {
//       setActionError(apiErrorMessage(err, 'Could not update payment status.'));
//     } finally {
//       setBusyId(null);
//     }
//   };

//   return (
//     <DashboardLayout stops={ownerStops} roleLabel="Owner">
//       <div className="dashboard-header">
//         <div>
//           <span className="eyebrow">Property #{hostelId}</span>
//           <h1 style={{ margin: 0 }}>Bookings</h1>
//         </div>
//       </div>

//       <Alert>{actionError}</Alert>

//       {loading && <Loader />}
//       {!loading && error && <EmptyState title="Couldn't load bookings" hint={error} />}
//       {!loading && !error && bookings.length === 0 && (
//         <EmptyState title="No bookings yet" hint="Bookings made by travelers will appear here." />
//       )}
//       {!loading && !error && bookings.length > 0 && (
//         <div className="card">
//           <table className="data-table">
//             <thead>
//               <tr>
//                 <th>Booking</th>
//                 <th>Traveler</th>
//                 <th>Dates</th>
//                 <th>Total</th>
//                 <th>Status</th>
//                 <th>Update status</th>
//                 <th>Payment</th>
//               </tr>
//             </thead>
//             <tbody>
//               {bookings.map((b) => (
//                 <tr key={b.id}>
//                   <td className="mono">{b.booking_number}</td>
//                   <td>{b.traveler_name}</td>
//                   <td>{b.check_in_date} → {b.check_out_date}</td>
//                   <td className="mono">Rs. {b.total_price}</td>
//                   <td><StatusStamp status={b.status} /></td>
//                   <td>
//                     <select
//                       value={b.status}
//                       disabled={busyId === b.id}
//                       onChange={(e) => changeStatus(b.id, e.target.value)}
//                       style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--line)', fontSize: 13 }}
//                     >
//                       {STATUS_OPTIONS.map((s) => (
//                         <option key={s} value={s}>{s.replace('_', ' ')}</option>
//                       ))}
//                     </select>
//                   </td>
//                   <td>
//                     <select
//                       value={b.payment_status || 'pending'}
//                       disabled={busyId === b.id}
//                       onChange={(e) => changePayment(b.id, e.target.value)}
//                       style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--line)', fontSize: 13 }}
//                     >
//                       {PAYMENT_OPTIONS.map((s) => (
//                         <option key={s} value={s}>{s}</option>
//                       ))}
//                     </select>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </DashboardLayout>
//   );
// }
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { Loader, EmptyState, Alert } from '../../components/Feedback';
import StatusStamp from '../../components/StatusStamp';
import { ownerStops } from './OwnerDashboard';
import { useHostelBookings, useUpdateBookingStatus } from '../../hooks/useBooking';
import { Calendar, User, Mail, Phone, DollarSign, RefreshCw } from 'lucide-react';

const STATUS_OPTIONS = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'];

export default function HostelBookings() {
  const { hostelId } = useParams();
  const [filter, setFilter] = useState('all');
  const { data: bookings, isLoading, error, refetch } = useHostelBookings(hostelId);
  const updateStatus = useUpdateBookingStatus();

  const handleStatusChange = async (bookingId, newStatus) => {
    if (window.confirm(`Change booking status to "${newStatus}"?`)) {
      await updateStatus.mutateAsync({ bookingId, status: newStatus });
      refetch();
    }
  };

  const filteredBookings = bookings?.filter(b => 
    filter === 'all' ? true : b.status === filter
  );

  if (isLoading) return <Loader />;
  if (error) return <EmptyState title="Couldn't load bookings" hint={error.message} />;

  const stats = {
    total: bookings?.length || 0,
    pending: bookings?.filter(b => b.status === 'pending').length || 0,
    confirmed: bookings?.filter(b => b.status === 'confirmed').length || 0,
    checked_in: bookings?.filter(b => b.status === 'checked_in').length || 0,
    cancelled: bookings?.filter(b => b.status === 'cancelled').length || 0,
  };

  return (
    <DashboardLayout stops={ownerStops} roleLabel="Owner">
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">Property #{hostelId}</span>
          <h1 style={{ margin: 0 }}>Bookings</h1>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => refetch()}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card"><div className="stat-value">{stats.total}</div><div className="stat-label">Total</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: 'var(--warning)' }}>{stats.pending}</div><div className="stat-label">Pending</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: 'var(--success)' }}>{stats.confirmed}</div><div className="stat-label">Confirmed</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: 'var(--info)' }}>{stats.checked_in}</div><div className="stat-label">Checked In</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: 'var(--danger)' }}>{stats.cancelled}</div><div className="stat-label">Cancelled</div></div>
      </div>

      {/* Filter */}
      <div className="filter-bar">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Bookings</option>
          {STATUS_OPTIONS.map(status => (
            <option key={status} value={status}>{status.replace('_', ' ').toUpperCase()}</option>
          ))}
        </select>
      </div>

      {!filteredBookings || filteredBookings.length === 0 ? (
        <EmptyState 
          title="No bookings found" 
          hint={filter === 'all' ? 'Bookings made by travelers will appear here.' : `No ${filter} bookings`}
        />
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking #</th>
                <th>Traveler</th>
                <th>Dates</th>
                <th>Room</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="mono" style={{ fontSize: 12 }}>{booking.booking_number}</td>
                  <td>
                    <div><strong>{booking.traveler_name}</strong></div>
                    <div style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                      <span><Mail size={12} /> {booking.traveler_email}</span>
                      {booking.traveler_phone && <span><Phone size={12} /> {booking.traveler_phone}</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13 }}>{booking.check_in_date}</div>
                    <div style={{ fontSize: 13 }}>→ {booking.check_out_date}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      {Math.ceil((new Date(booking.check_out_date) - new Date(booking.check_in_date)) / (1000 * 60 * 60 * 24))} nights
                    </div>
                  </td>
                  <td>{booking.room_type_name}</td>
                  <td className="mono" style={{ fontWeight: 600, color: 'var(--clay)' }}>
                    Rs. {booking.total_price}
                  </td>
                  <td><StatusStamp status={booking.status} /></td>
                  <td>
                    <span style={{ 
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      background: booking.payment_status === 'paid' ? 'var(--success-light)' : 'var(--warning-light)',
                      color: booking.payment_status === 'paid' ? 'var(--success)' : 'var(--warning)',
                      fontSize: 11,
                      fontWeight: 600
                    }}>
                      {booking.payment_status || 'pending'}
                    </span>
                  </td>
                  <td>
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                      disabled={updateStatus.isLoading}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid var(--border)',
                        fontSize: 12,
                        background: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      {STATUS_OPTIONS.map(status => (
                        <option key={status} value={status}>{status.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}