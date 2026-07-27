// import { useEffect, useState } from 'react';
// import { useParams, useSearchParams, Link } from 'react-router-dom';
// import PublicNavbar from '../components/PublicNavbar';
// import { EmptyState } from '../components/Feedback';
// import BookingForm from '../components/BookingForm';
// import PhotoSphereViewer from '../components/PhotoSphereViewer';
// import { getHostel } from '../api/hostels';
// import { getHostelReviews } from '../api/reviews';
// import { apiErrorMessage, resolveUploadUrl } from '../api/client';
// import {
//   MapPin, Star, Users, Home, Calendar, Clock, Check, X,
//   Bed, Bath, Tv, Wifi, Coffee, Car, Mountain, Utensils, Wind,
// } from 'lucide-react';

// const safeParseJSON = (data) => {
//   if (!data) return [];
//   if (Array.isArray(data)) return data;
//   if (typeof data === 'string') {
//     try {
//       const parsed = JSON.parse(data);
//       return Array.isArray(parsed) ? parsed : [];
//     } catch {
//       return [];
//     }
//   }
//   return [];
// };

// const scoreWord = (r) => {
//   const n = Number(r) || 0;
//   if (n >= 4.5) return 'Exceptional';
//   if (n >= 4.0) return 'Excellent';
//   if (n >= 3.5) return 'Very good';
//   if (n >= 3.0) return 'Good';
//   return n > 0 ? 'Review score' : 'New';
// };

// export default function HostelDetail() {
//   const { id } = useParams();
//   const [params] = useSearchParams();
//   const searchContext = {
//     checkIn: params.get('checkIn') || '',
//     checkOut: params.get('checkOut') || '',
//     guests: params.get('guests') || '',
//   };

//   const [hostel, setHostel] = useState(null);
//   const [reviews, setReviews] = useState({ data: [] });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [activeTab, setActiveTab] = useState('details');
//   const [selectedImage, setSelectedImage] = useState(0);
//   const [show360, setShow360] = useState(false);
//   const [selectedRoomId, setSelectedRoomId] = useState(null);

//   useEffect(() => {
//     const load = async () => {
//       setLoading(true);
//       try {
//         const hostelRes = await getHostel(id);
//         if (hostelRes.data.success) {
//           const data = hostelRes.data.data;
//           if (typeof data.amenities === 'string') {
//             try { data.amenities = JSON.parse(data.amenities); } catch { data.amenities = []; }
//           }
//           if (typeof data.room_types === 'string') {
//             try { data.room_types = JSON.parse(data.room_types); } catch { data.room_types = []; }
//           }
//           setHostel(data);
//         }
//         try {
//           const reviewsRes = await getHostelReviews(id);
//           if (reviewsRes.data.success) setReviews(reviewsRes.data);
//         } catch {
//           setReviews({ data: [] });
//         }
//       } catch (err) {
//         setError(apiErrorMessage(err, 'Could not load this stay.'));
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, [id]);

//   const reserveRoom = (roomId) => {
//     setSelectedRoomId(roomId);
//     document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
//   };

//   if (loading) {
//     return (
//       <div className="app-shell tz-page">
//         <PublicNavbar />
//         <div className="loader-container"><div className="spinner"></div></div>
//       </div>
//     );
//   }

//   if (error || !hostel) {
//     return (
//       <div className="app-shell tz-page">
//         <PublicNavbar />
//         <div className="error-container">
//           <EmptyState title="Stay not found" hint={error} />
//           <Link to="/hostels"><button className="tz-btn tz-btn--primary">Browse stays</button></Link>
//         </div>
//       </div>
//     );
//   }

//   const amenities = safeParseJSON(hostel.amenities);
//   const roomTypes = safeParseJSON(hostel.room_types);
//   const photos = safeParseJSON(hostel.photos);
//   const has360View = photos.some((p) => p.is_360);
//   const rating = Number(hostel.rating) || 0;
//   const prices = roomTypes.map((r) => Number(r.price_per_night)).filter((p) => p > 0);
//   const fromPrice = prices.length ? Math.min(...prices) : null;

//   const renderStars = (value) => {
//     const num = Number(value) || 0;
//     const full = Math.floor(num);
//     return (
//       <span className="stars">
//         {[...Array(full)].map((_, i) => <Star key={`f${i}`} size={15} fill="#f5a623" color="#f5a623" />)}
//         {[...Array(5 - full)].map((_, i) => <Star key={`e${i}`} size={15} color="#dbe3ef" />)}
//       </span>
//     );
//   };

//   const getAmenityIcon = (amenity) => {
//     const icons = {
//       wifi: <Wifi size={16} />,
//       breakfast: <Coffee size={16} />,
//       parking: <Car size={16} />,
//       mountain_view: <Mountain size={16} />,
//       tv: <Tv size={16} />,
//       attached_bathroom: <Bath size={16} />,
//       heater: <Wind size={16} />,
//       restaurant: <Utensils size={16} />,
//       balcony: <Home size={16} />,
//       laundry: <Home size={16} />,
//     };
//     return icons[amenity] || <Check size={16} />;
//   };

//   return (
//     <div className="app-shell tz-page">
//       <PublicNavbar />

//       {/* Always-on key info bar — name, context, price, reserve */}
//       <div className="tz-keybar">
//         <div className="tz-container tz-keybar-inner">
//           <div className="tz-keybar-id">
//             <strong>{hostel.name}</strong>
//             <span>
//               <MapPin size={12} /> {hostel.city}
//               {searchContext.checkIn && searchContext.checkOut
//                 ? ` · ${searchContext.checkIn} → ${searchContext.checkOut}`
//                 : ''}
//               {searchContext.guests ? ` · ${searchContext.guests} guests` : ''}
//             </span>
//           </div>
//           <div className="tz-keybar-cta">
//             {fromPrice && (
//               <span className="tz-keybar-price">
//                 From <strong>Rs {fromPrice.toLocaleString()}</strong>/night
//               </span>
//             )}
//             <button className="tz-btn tz-btn--primary tz-btn--sm" onClick={() => reserveRoom(null)}>
//               Reserve
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Gallery */}
//       <div className="tz-container">
//         <div className="hostel-gallery tz-gallery">
//           {show360 && photos[selectedImage] ? (
//             <PhotoSphereViewer imageUrl={resolveUploadUrl(photos[selectedImage].photo_url)} height="500px" />
//           ) : (
//             <div className="gallery-grid">
//               <div className="gallery-main">
//                 {photos.length > 0 ? (
//                   <img src={resolveUploadUrl(photos[selectedImage].photo_url)} alt={hostel.name} />
//                 ) : (
//                   <div className="no-image">No photos yet</div>
//                 )}
//               </div>
//               <div className="gallery-thumbnails">
//                 {photos.slice(0, 4).map((photo, index) => (
//                   <div
//                     key={index}
//                     className={`thumb ${selectedImage === index ? 'active' : ''}`}
//                     onClick={() => setSelectedImage(index)}
//                   >
//                     <img src={resolveUploadUrl(photo.photo_url)} alt={`${hostel.name} ${index + 1}`} />
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//           {has360View && (
//             <button className="btn-360" onClick={() => setShow360(!show360)}>
//               {show360 ? 'Gallery view' : '360° view'}
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Content */}
//       <div className="tz-container hostel-detail-content tz-detail">
//         <div className="content-left">
//           <div className="detail-header tz-detail-header">
//             <div>
//               <h1>{hostel.name}</h1>
//               <div className="detail-location">
//                 <MapPin size={16} />
//                 <span>{hostel.city}, {hostel.state || 'Pakistan'}</span>
//                 <span className="dot">•</span>
//                 <span className="property-type">{hostel.property_type || 'Hostel'}</span>
//               </div>
//             </div>
//             <div className="tz-score">
//               <div className="tz-score-text">
//                 <strong>{scoreWord(rating)}</strong>
//                 <span>{hostel.total_reviews || 0} reviews</span>
//               </div>
//               <span className="tz-score-plate">{rating > 0 ? rating.toFixed(1) : '—'}</span>
//             </div>
//           </div>

//           {/* Tabs */}
//           <div className="detail-tabs">
//             {['details', 'rooms', 'reviews'].map((tab) => (
//               <button
//                 key={tab}
//                 className={`tab ${activeTab === tab ? 'active' : ''}`}
//                 onClick={() => setActiveTab(tab)}
//               >
//                 {tab === 'details' ? 'Overview' : tab === 'rooms' ? 'Rooms' : `Reviews (${reviews.data?.length || 0})`}
//               </button>
//             ))}
//           </div>

//           <div className="tab-content">
//             {activeTab === 'details' && (
//               <>
//                 <div className="description">
//                   <h3>Overview</h3>
//                   <p>{hostel.description || 'No description available.'}</p>
//                 </div>

//                 {amenities.length > 0 && (
//                   <div className="amenities-list">
//                     <h3>Amenities</h3>
//                     <div className="amenities-grid">
//                       {amenities.map((item, index) => (
//                         <div key={index} className="amenity-item">
//                           {getAmenityIcon(item)}
//                           <span>{String(item).replace(/_/g, ' ')}</span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 <div className="policies">
//                   <h3>Good to know</h3>
//                   <div className="policy-grid">
//                     <div className="policy-item">
//                       <Clock size={20} />
//                       <div>
//                         <h4>Check-in</h4>
//                         <p>{hostel.check_in_time?.slice(0, 5) || '14:00'}</p>
//                       </div>
//                     </div>
//                     <div className="policy-item">
//                       <Clock size={20} />
//                       <div>
//                         <h4>Check-out</h4>
//                         <p>{hostel.check_out_time?.slice(0, 5) || '12:00'}</p>
//                       </div>
//                     </div>
//                     <div className="policy-item">
//                       <Calendar size={20} />
//                       <div>
//                         <h4>Minimum stay</h4>
//                         <p>{hostel.min_stay_days || 1} night(s)</p>
//                       </div>
//                     </div>
//                     <div className="policy-item">
//                       <X size={20} />
//                       <div>
//                         <h4>Cancellation</h4>
//                         <p style={{ textTransform: 'capitalize' }}>{hostel.cancellation_policy || 'moderate'}</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </>
//             )}

//             {activeTab === 'rooms' && (
//               <div className="rooms-list">
//                 <h3>Choose your room</h3>
//                 {roomTypes.length > 0 ? (
//                   roomTypes.map((room) => (
//                     <div
//                       key={room.id}
//                       className={`tz-room ${selectedRoomId === room.id ? 'tz-room--selected' : ''}`}
//                     >
//                       <div className="tz-room-info">
//                         <h4><Bed size={15} /> {room.name}</h4>
//                         {room.description && <p>{room.description}</p>}
//                         <div className="tz-room-meta">
//                           <span><Users size={13} /> Sleeps {room.capacity}</span>
//                           <span>{room.total_rooms} available</span>
//                         </div>
//                       </div>
//                       <div className="tz-room-book">
//                         <div className="tz-card-price">
//                           <span className="tz-price-value">Rs {Number(room.price_per_night).toLocaleString()}</span>
//                           <span className="tz-price-label">per night</span>
//                         </div>
//                         <button
//                           className="tz-btn tz-btn--primary tz-btn--sm"
//                           onClick={() => reserveRoom(room.id)}
//                         >
//                           Reserve
//                         </button>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <p className="muted">No room types listed yet.</p>
//                 )}
//               </div>
//             )}

//             {activeTab === 'reviews' && (
//               <div className="reviews-list">
//                 {reviews.data && reviews.data.length > 0 ? (
//                   reviews.data.map((review) => (
//                     <div key={review.id} className="review-item">
//                       <div className="review-header">
//                         <div className="reviewer-info">
//                           <div className="reviewer-avatar">{review.user_name?.charAt(0) || 'U'}</div>
//                           <div>
//                             <strong>{review.user_name || 'Anonymous'}</strong>
//                             <span>{new Date(review.created_at).toLocaleDateString()}</span>
//                           </div>
//                         </div>
//                         <div className="review-rating">{renderStars(review.rating)}</div>
//                       </div>
//                       <p className="review-comment">{review.comment}</p>
//                     </div>
//                   ))
//                 ) : (
//                   <p className="muted">No reviews yet — be the first after your stay.</p>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Sticky booking card, prefilled from the search */}
//         <div className="content-right">
//           <BookingForm
//             hostelId={hostel.id}
//             roomTypes={roomTypes}
//             initial={searchContext}
//             selectedRoomId={selectedRoomId}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }



import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import { Loader, EmptyState } from '../components/Feedback';
import BookingForm from '../components/BookingForm';
import PhotoSphereViewer from '../components/PhotoSphereViewer';
import WeatherWidget from '../components/weather/WeatherWidget';
import HotelPackages from '../components/packages/HotelPackages';
import BudgetEstimator from '../components/BudgetEstimator';
import NearbyItinerary from '../components/NearbyItinerary';
import NegotiationModal from '../components/NegotiationModal';
import WaitingListModal from '../components/WaitingListModal';
import { getHostel } from '../api/hostels';
import { getHostelReviews } from '../api/reviews';
import { getHostelPackages, bookPackage } from '../api/packages';
import { apiErrorMessage, resolveUploadUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  MapPin, Star, Users, Home, Calendar, Clock, Check, X,
  Heart, Bed, Bath, Tv, Wifi, Coffee, Car, Mountain, Utensils, Wind, RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';

const safeParseJSON = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }
  return [];
};

export default function HostelDetail() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [hostel, setHostel] = useState(null);
  const [reviews, setReviews] = useState({ data: [] });
  const [packages, setPackages] = useState([]);
  const [negotiatingRoom, setNegotiatingRoom] = useState(null);
  const [waitlistingRoom, setWaitlistingRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [selectedImage, setSelectedImage] = useState(0);
  const [show360, setShow360] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const hostelRes = await getHostel(id);
        if (hostelRes.data.success) {
          const data = hostelRes.data.data;
          if (typeof data.amenities === 'string') {
            try { data.amenities = JSON.parse(data.amenities); } catch(e) { data.amenities = []; }
          }
          if (typeof data.room_types === 'string') {
            try { data.room_types = JSON.parse(data.room_types); } catch(e) { data.room_types = []; }
          }
          setHostel(data);
        }
        try {
          const reviewsRes = await getHostelReviews(id);
          if (reviewsRes.data.success) setReviews(reviewsRes.data);
        } catch (reviewErr) { setReviews({ data: [] }); }
        try {
          const packagesRes = await getHostelPackages(id);
          if (packagesRes.data.success) setPackages(packagesRes.data.data || []);
        } catch (packagesErr) { setPackages([]); }
      } catch (err) {
        setError(apiErrorMessage(err, 'Could not load this stay.'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleBookPackage = async (packageId, dates) => {
    if (!isAuthenticated || user?.role !== 'traveler') {
      toast.error('Log in as a traveler to book a package.');
      return;
    }
    try {
      await bookPackage(packageId, { check_in_date: dates.check_in, check_out_date: dates.check_out });
      toast.success('Package booked!');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not book this package.'));
    }
  };

  if (loading) return (
    <div className="app-shell">
      <PublicNavbar />
      <div className="loader-container"><div className="spinner"></div></div>
    </div>
  );

  if (error || !hostel) return (
    <div className="app-shell">
      <PublicNavbar />
      <div className="error-container">
        <EmptyState title="Stay not found" hint={error} />
        <Link to="/hostels"><button className="btn btn-primary">Browse Hostels</button></Link>
      </div>
    </div>
  );

  const amenities = safeParseJSON(hostel.amenities);
  const roomTypes = safeParseJSON(hostel.room_types);
  const photos = safeParseJSON(hostel.photos);
  const has360View = photos.some(p => p.is_360);

  const renderStars = (rating) => {
    const num = Number(rating) || 0;
    const full = Math.floor(num);
    const empty = 5 - full;
    return (
      <span className="stars">
        {[...Array(full)].map((_, i) => <Star key={i} size={18} fill="#f59e0b" color="#f59e0b" />)}
        {[...Array(empty)].map((_, i) => <Star key={i} size={18} color="#e2e8f0" />)}
      </span>
    );
  };

  const getAmenityIcon = (amenity) => {
    const icons = {
      wifi: <Wifi size={16} />,
      breakfast: <Coffee size={16} />,
      parking: <Car size={16} />,
      mountain_view: <Mountain size={16} />,
      tv: <Tv size={16} />,
      attached_bathroom: <Bath size={16} />,
      heater: <Wind size={16} />,
      restaurant: <Utensils size={16} />,
      balcony: <Home size={16} />,
      laundry: <Home size={16} />,
    };
    return icons[amenity] || <Check size={16} />;
  };

  // Get image URL helper
  const getImageUrl = (photoUrl) => {
    if (!photoUrl) return null;
    return resolveUploadUrl(photoUrl);
  };

  return (
    <div className="app-shell">
      <PublicNavbar />

      {/* Gallery Section - FIXED */}
      <div className="hostel-gallery">
        {show360 && photos.length > 0 ? (
          <PhotoSphereViewer 
            imageUrl={getImageUrl(photos[selectedImage]?.photo_url)} 
            height="500px" 
          />
        ) : photos.length > 0 ? (
          <div className="gallery-grid">
            <div className="gallery-main">
              <img 
                src={getImageUrl(photos[selectedImage]?.photo_url)} 
                alt={hostel.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  console.error('❌ Gallery image failed to load:', photos[selectedImage]?.photo_url);
                  e.target.style.display = 'none';
                  const parent = e.target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div style="display:flex;align-items:center;justify-content:center;height:100%;background:#1e293b;color:rgba(255,255,255,0.3);font-size:18px;">
                        📸 Image Not Available
                      </div>
                    `;
                  }
                }}
              />
            </div>
            <div className="gallery-thumbnails">
              {photos.slice(0, 4).map((photo, index) => (
                <div 
                  key={index} 
                  className={`thumb ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                  style={{ cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
                >
                  <img 
                    src={getImageUrl(photo.photo_url)} 
                    alt={`${hostel.name} ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  {photo.is_360 && (
                    <div style={{
                      position: 'absolute',
                      bottom: 4,
                      right: 4,
                      background: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2
                    }}>
                      <RotateCcw size={10} /> 360
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="no-image" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            background: '#1e293b',
            color: 'rgba(255,255,255,0.3)',
            fontSize: '18px'
          }}>
            📸 No Photos Available
          </div>
        )}
        {has360View && (
          <button 
            className="btn-360" 
            onClick={() => setShow360(!show360)}
            style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              zIndex: 10,
              cursor: 'pointer'
            }}
          >
            {show360 ? '📷 Gallery View' : '🔄 360° View'}
          </button>
        )}
      </div>

      {/* Rest of the component... */}
      <div className="hostel-detail-content">
        <div className="content-left">
          {/* Header */}
          <div className="detail-header">
            <div>
              <h1>{hostel.name}</h1>
              <div className="detail-location">
                <MapPin size={16} />
                <span>{hostel.city}, {hostel.state || 'Pakistan'}</span>
                <span className="dot">•</span>
                <span className="property-type">{hostel.property_type || 'Hostel'}</span>
              </div>
            </div>
            <div className="detail-rating">
              <div className="rating-score">
                <span className="score">{Number(hostel.rating || 0).toFixed(1)}</span>
                {renderStars(hostel.rating)}
                <span className="review-count">{hostel.total_reviews || 0} reviews</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="detail-tabs">
            <button 
              className={`tab ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              Overview
            </button>
            <button 
              className={`tab ${activeTab === 'rooms' ? 'active' : ''}`}
              onClick={() => setActiveTab('rooms')}
            >
              Rooms
            </button>
            <button
              className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({reviews.data?.length || 0})
            </button>
            <button
              className={`tab ${activeTab === 'trip' ? 'active' : ''}`}
              onClick={() => setActiveTab('trip')}
            >
              Trip tools
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'details' && (
              <>
                <div className="description">
                  <h3>Overview</h3>
                  <p>{hostel.description || 'No description available.'}</p>
                </div>

                {amenities.length > 0 && (
                  <div className="amenities-list">
                    <h3>Room Amenities</h3>
                    <div className="amenities-grid">
                      {amenities.map((item, index) => (
                        <div key={index} className="amenity-item">
                          {getAmenityIcon(item)}
                          <span>{item.replace('_', ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="policies">
                  <h3>Booking Rules</h3>
                  <div className="policy-grid">
                    <div className="policy-item">
                      <Clock size={20} />
                      <div>
                        <h4>Check-in</h4>
                        <p>{hostel.check_in_time?.slice(0, 5) || '14:00'}</p>
                      </div>
                    </div>
                    <div className="policy-item">
                      <Clock size={20} />
                      <div>
                        <h4>Check-out</h4>
                        <p>{hostel.check_out_time?.slice(0, 5) || '12:00'}</p>
                      </div>
                    </div>
                    <div className="policy-item">
                      <Calendar size={20} />
                      <div>
                        <h4>Min Stay</h4>
                        <p>{hostel.min_stay_days || 1} night(s)</p>
                      </div>
                    </div>
                    <div className="policy-item">
                      <X size={20} />
                      <div>
                        <h4>Cancellation</h4>
                        <p style={{ textTransform: 'capitalize' }}>{hostel.cancellation_policy || 'moderate'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'rooms' && (
              <div className="rooms-list">
                <h3>Available Rooms</h3>
                {roomTypes.length > 0 ? (
                  roomTypes.map((room) => (
                    <div key={room.id} className="room-card">
                      <div className="room-info">
                        <h4>{room.name}</h4>
                        <p>{room.description}</p>
                        <div className="room-details">
                          <span><Users size={14} /> {room.capacity} guests</span>
                          <span>{room.total_rooms} rooms available</span>
                        </div>
                      </div>
                      <div className="room-price">
                        <span className="price">Rs. {room.price_per_night}</span>
                        <span className="per-night">/ night</span>
                        {isAuthenticated && user?.role === 'traveler' && (
                          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <button className="btn btn-outline btn-sm" onClick={() => setNegotiatingRoom(room)}>
                              Make an offer
                            </button>
                            <button className="btn btn-outline btn-sm" onClick={() => setWaitlistingRoom(room)}>
                              Notify me
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No room types listed yet.</p>
                )}
              </div>
            )}

            {negotiatingRoom && (
              <NegotiationModal
                hostel={hostel}
                roomType={negotiatingRoom}
                onClose={() => setNegotiatingRoom(null)}
              />
            )}

            {waitlistingRoom && (
              <WaitingListModal
                hostel={hostel}
                roomType={waitlistingRoom}
                onClose={() => setWaitlistingRoom(null)}
              />
            )}

            {activeTab === 'reviews' && (
              <div className="reviews-list">
                {reviews.sentiment && reviews.sentiment.total > 0 && (
                  <div className="card card-pad" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 28 }}>
                      {reviews.sentiment.positive_pct >= 65 ? '😊' : reviews.sentiment.positive_pct <= 35 ? '😞' : '😐'}
                    </div>
                    <div>
                      <strong>{reviews.sentiment.positive_pct}% positive</strong>
                      <p className="muted" style={{ margin: '2px 0 0', fontSize: 13 }}>
                        Based on {reviews.sentiment.total} review{reviews.sentiment.total === 1 ? '' : 's'} —{' '}
                        {reviews.sentiment.positive} positive, {reviews.sentiment.neutral} neutral, {reviews.sentiment.negative} negative
                      </p>
                    </div>
                  </div>
                )}
                {reviews.data && reviews.data.length > 0 ? (
                  reviews.data.map((review) => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <div className="reviewer-info">
                          <div className="reviewer-avatar">
                            {review.user_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <strong>{review.user_name || 'Anonymous'}</strong>
                            <span>{new Date(review.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="review-rating" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {review.sentiment_label && (
                            <span
                              className={`stamp ${review.sentiment_label === 'Positive' ? 'stamp-confirmed' : review.sentiment_label === 'Negative' ? 'stamp-cancelled' : 'stamp-pending'}`}
                              title={`${review.sentiment_confidence || 0}% confidence`}
                            >
                              {review.sentiment_label === 'Positive' ? '😊' : review.sentiment_label === 'Negative' ? '😞' : '😐'} {review.sentiment_label}
                            </span>
                          )}
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <p className="review-comment">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No reviews yet.</p>
                )}
              </div>
            )}

            {activeTab === 'trip' && (
              <div className="trip-tools" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <WeatherWidget
                  city={hostel.city}
                  checkInDate={new Date().toISOString().split('T')[0]}
                  checkOutDate={new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0]}
                />
                <NearbyItinerary hostelId={hostel.id} />
                <BudgetEstimator destination={hostel.city} />
                <HotelPackages packages={packages} hostelId={hostel.id} onBook={handleBookPackage} />
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Booking Card */}
        <div className="content-right">
          <BookingForm hostelId={hostel.id} roomTypes={roomTypes} hostelCity={hostel.city} />
        </div>
      </div>
    </div>
  );
}