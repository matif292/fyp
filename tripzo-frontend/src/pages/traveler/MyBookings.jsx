// import { useEffect, useState } from 'react';
// import DashboardLayout from '../../components/DashboardLayout';
// import { Loader, EmptyState, Alert } from '../../components/Feedback';
// import StatusStamp from '../../components/StatusStamp';
// import { getMyBookings, cancelBooking } from '../../api/bookings';
// import { addReview } from '../../api/reviews';
// import { apiErrorMessage } from '../../api/client';
// import { X, Star } from 'lucide-react';
// import { travelerStops } from './travelerStops.jsx';

// export default function MyBookings() {
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [reviewFor, setReviewFor] = useState(null);
//   const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
//   const [actionError, setActionError] = useState('');
//   const [busyId, setBusyId] = useState(null);

//   const load = async () => {
//     setLoading(true);
//     try {
//       const { data } = await getMyBookings();
//       setBookings(data.data || []);
//     } catch (err) {
//       setError(apiErrorMessage(err, 'Could not load your bookings.'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, []);

//   const cancel = async (id) => {
//     setBusyId(id);
//     setActionError('');
//     try {
//       await cancelBooking(id);
//       load();
//     } catch (err) {
//       setActionError(apiErrorMessage(err, 'Could not cancel this booking.'));
//     } finally {
//       setBusyId(null);
//     }
//   };

//   const submitReview = async (e) => {
//     e.preventDefault();
//     setActionError('');
//     try {
//       await addReview({
//         booking_id: reviewFor.id,
//         hostel_id: reviewFor.hostel_id,
//         rating: Number(reviewForm.rating),
//         comment: reviewForm.comment,
//       });
//       setReviewFor(null);
//       setReviewForm({ rating: 5, comment: '' });
//       load();
//     } catch (err) {
//       setActionError(apiErrorMessage(err, 'Could not submit review.'));
//     }
//   };

//   return (
//     <DashboardLayout stops={travelerStops} roleLabel="Traveler">
//       <div className="dashboard-header">
//         <div>
//           <span className="eyebrow">Your route so far</span>
//           <h1 style={{ margin: 0 }}>My bookings</h1>
//         </div>
//       </div>

//       <Alert>{actionError}</Alert>

//       {loading && <Loader />}
//       {!loading && error && <EmptyState title="Couldn't load bookings" hint={error} />}
//       {!loading && !error && bookings.length === 0 && (
//         <EmptyState title="No bookings yet" hint="Once you book a stay, it'll show up here." />
//       )}
//       {!loading && !error && bookings.length > 0 && (
//         <div className="card">
//           <table className="data-table">
//             <thead>
//               <tr>
//                 <th>Booking</th>
//                 <th>Hostel</th>
//                 <th>Dates</th>
//                 <th>Total</th>
//                 <th>Status</th>
//                 <th>Payment</th>
//                 <th></th>
//               </tr>
//             </thead>
//             <tbody>
//               {bookings.map((b) => (
//                 <tr key={b.id}>
//                   <td className="mono">{b.booking_number}</td>
//                   <td>{b.hostel_name}</td>
//                   <td>{b.check_in_date} → {b.check_out_date}</td>
//                   <td className="mono">Rs. {b.total_price}</td>
//                   <td><StatusStamp status={b.status} /></td>
//                   <td className="muted" style={{ textTransform: 'capitalize' }}>{b.payment_status || 'pending'}</td>
//                   <td>
//                     <div style={{ display: 'flex', gap: 8 }}>
//                       {b.status !== 'cancelled' && b.status !== 'checked_in' && (
//                         <button className="btn btn-danger btn-sm" disabled={busyId === b.id} onClick={() => cancel(b.id)}>
//                           {busyId === b.id ? '…' : 'Cancel'}
//                         </button>
//                       )}
//                       {['confirmed', 'checked_in', 'checked_out'].includes(b.status) && (
//                         <button className="btn btn-outline btn-sm" onClick={() => setReviewFor(b)}>
//                           Review
//                         </button>
//                       )}
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {reviewFor && (
//         <div className="modal-overlay" onClick={() => setReviewFor(null)}>
//           <div className="modal-box" onClick={(e) => e.stopPropagation()}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
//               <h3 style={{ margin: 0 }}>Review {reviewFor.hostel_name}</h3>
//               <button className="btn btn-sm btn-outline" onClick={() => setReviewFor(null)}><X size={14} /></button>
//             </div>
//             <form onSubmit={submitReview}>
//               <div className="field">
//                 <label>Rating</label>
//                 <select value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}>
//                   {[5, 4, 3, 2, 1].map((n) => (
//                     <option key={n} value={n}>{n} {'★'.repeat(n)}</option>
//                   ))}
//                 </select>
//               </div>
//               <div className="field">
//                 <label>Comment</label>
//                 <textarea
//                   required
//                   value={reviewForm.comment}
//                   onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
//                   placeholder="Share how your stay went…"
//                 />
//               </div>
//               <button className="btn btn-primary btn-block" type="submit">
//                 <Star size={14} /> Submit review
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </DashboardLayout>
//   );
// }
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Loader, EmptyState, Alert } from '../../components/Feedback';
import StatusStamp from '../../components/StatusStamp';
import { getMyBookings, cancelBooking } from '../../api/bookings';
import { addReview } from '../../api/reviews';
import { getWeatherForDates } from '../../api/weather';
import { apiErrorMessage } from '../../api/client';
import { X, Star, Calendar, MapPin, DollarSign } from 'lucide-react';
import { travelerStops } from './travelerStops.jsx';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewFor, setReviewFor] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [weatherByBooking, setWeatherByBooking] = useState({});

  const load = async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const response = await getMyBookings();
      console.log('📦 Bookings API Response:', response.data);
      
      // Handle different response structures
      let bookingsData = [];
      if (response.data && response.data.success) {
        bookingsData = response.data.data || [];
      } else if (response.data && response.data.data) {
        bookingsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        bookingsData = response.data;
      }
      
      console.log('📋 Bookings data:', bookingsData);
      setBookings(bookingsData);
      
      if (bookingsData.length === 0) {
        setSuccessMessage('No bookings found. Start exploring and book your first stay!');
      }
    } catch (err) {
      console.error('❌ Error loading bookings:', err);
      setError(apiErrorMessage(err, 'Could not load your bookings.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const today = new Date();
    const upcoming = bookings.filter((b) => {
      if (b.status === 'cancelled' || !b.hostel_city || !b.check_in_date) return false;
      return new Date(b.check_in_date) >= today;
    }).slice(0, 6);

    upcoming.forEach(async (b) => {
      if (weatherByBooking[b.id]) return;
      try {
        const { data } = await getWeatherForDates(b.hostel_city, b.check_in_date, b.check_out_date);
        const day = data?.data?.forecast?.forecastday?.[0];
        if (day) {
          setWeatherByBooking((prev) => ({
            ...prev,
            [b.id]: { icon: day.day.condition.icon, text: day.day.condition.text, avgTemp: Math.round(day.day.avgtemp_c) },
          }));
        }
      } catch {
        // weather is a nice-to-have; silently skip if the forecast can't be fetched
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings]);

  const cancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    setBusyId(id);
    setActionError('');
    try {
      await cancelBooking(id);
      setSuccessMessage('Booking cancelled successfully!');
      load();
    } catch (err) {
      setActionError(apiErrorMessage(err, 'Could not cancel this booking.'));
    } finally {
      setBusyId(null);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      await addReview({
        booking_id: reviewFor.id,
        hostel_id: reviewFor.hostel_id,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });
      setSuccessMessage('Review submitted successfully!');
      setReviewFor(null);
      setReviewForm({ rating: 5, comment: '' });
      load();
    } catch (err) {
      setActionError(apiErrorMessage(err, 'Could not submit review.'));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#b7791f',
      confirmed: '#1e8e5a',
      checked_in: '#0e7490',
      checked_out: '#6b7280',
      cancelled: '#c0392b',
    };
    return colors[status] || '#6b7280';
  };

  return (
    <DashboardLayout stops={travelerStops} roleLabel="Traveler">
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">Your route so far</span>
          <h1 style={{ margin: 0 }}>My Bookings</h1>
          <p className="muted">Manage all your hostel reservations</p>
        </div>
      </div>

      <Alert>{actionError}</Alert>
      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}

      {loading && <Loader />}
      
      {!loading && error && (
        <EmptyState title="Couldn't load bookings" hint={error} />
      )}
      
      {!loading && !error && bookings.length === 0 && (
        <EmptyState 
          title="No bookings yet" 
          hint="Once you book a stay, it'll show up here. Start exploring hostels now!"
          action={
            <a href="/hostels" className="btn btn-primary" style={{ marginTop: 12 }}>
              Explore Hostels
            </a>
          }
        />
      )}
      
      {!loading && !error && bookings.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Booking Cards */}
          {bookings.map((booking) => (
            <div key={booking.id} className="card card-pad" style={{ transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between' }}>
                {/* Left: Booking Details */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0 }}>{booking.hostel_name || 'Unknown Hostel'}</h3>
                    <StatusStamp status={booking.status || 'pending'} />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                      <Calendar size={14} />
                      <span>{booking.check_in_date} → {booking.check_out_date}</span>
                      {weatherByBooking[booking.id] && (
                        <span
                          title={weatherByBooking[booking.id].text}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 6, padding: '1px 8px', borderRadius: 12, background: '#eef6ff', color: '#1d5fa8', fontSize: 12, fontWeight: 600 }}
                        >
                          <img src={weatherByBooking[booking.id].icon} alt="" width={16} height={16} />
                          {weatherByBooking[booking.id].avgTemp}°C
                        </span>
                      )}
                    </div>
                    {booking.hostel_city && (
                      <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                        <MapPin size={14} />
                        <span>{booking.hostel_city}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 6, fontSize: 14 }}>
                      {booking.room_type_name && (
                        <span><strong>Room:</strong> {booking.room_type_name}</span>
                      )}
                      <span><strong>Guests:</strong> {booking.total_guests || 1}</span>
                      <span className="mono" style={{ fontWeight: 700, color: 'var(--clay)' }}>
                        <DollarSign size={14} style={{ display: 'inline' }} />
                        Rs. {booking.total_price || 0}
                      </span>
                      <span style={{ 
                        padding: '2px 10px', 
                        borderRadius: '12px', 
                        background: booking.payment_status === 'paid' ? '#e6f4ea' : '#fdf1e0',
                        color: booking.payment_status === 'paid' ? '#1e8e5a' : '#b7791f',
                        fontSize: 12,
                        fontWeight: 600
                      }}>
                        {booking.payment_status || 'pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  {booking.status !== 'cancelled' && booking.status !== 'checked_in' && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => cancel(booking.id)}
                      disabled={busyId === booking.id}
                    >
                      {busyId === booking.id ? '…' : 'Cancel'}
                    </button>
                  )}
                  {['confirmed', 'checked_in', 'checked_out'].includes(booking.status) && (
                    <button 
                      className="btn btn-outline btn-sm" 
                      onClick={() => setReviewFor(booking)}
                    >
                      <Star size={14} /> Review
                    </button>
                  )}
                  <a href={`/hostels/${booking.hostel_id}`}>
                    <button className="btn btn-outline btn-sm">View Hostel</button>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewFor && (
        <div className="modal-overlay" onClick={() => setReviewFor(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ margin: 0 }}>Review {reviewFor.hostel_name}</h3>
              <button className="btn btn-sm btn-outline" onClick={() => setReviewFor(null)}>
                <X size={14} />
              </button>
            </div>
            <form onSubmit={submitReview}>
              <div className="field">
                <label>Rating</label>
                <select 
                  value={reviewForm.rating} 
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} {'★'.repeat(n)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Comment</label>
                <textarea
                  required
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Share how your stay went…"
                  rows={4}
                />
              </div>
              <button className="btn btn-primary btn-block" type="submit">
                <Star size={14} style={{ marginRight: 8 }} />
                Submit review
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}