// import { Link } from 'react-router-dom';
// import { MapPin, Image, Wifi, Coffee, Car, Mountain, Check } from 'lucide-react';
// import { resolveUploadUrl } from '../api/client';

// const scoreWord = (r) => {
//   const n = Number(r) || 0;
//   if (n >= 4.5) return 'Exceptional';
//   if (n >= 4.0) return 'Excellent';
//   if (n >= 3.5) return 'Very good';
//   if (n >= 3.0) return 'Good';
//   if (n > 0) return 'Review score';
//   return 'New';
// };

// const safeParse = (data) => {
//   if (!data) return [];
//   if (Array.isArray(data)) return data;
//   try {
//     const p = JSON.parse(data);
//     return Array.isArray(p) ? p : [];
//   } catch {
//     return [];
//   }
// };

// const AMENITY_ICONS = {
//   wifi: Wifi,
//   breakfast: Coffee,
//   parking: Car,
//   mountain_view: Mountain,
// };

// /** Lowest nightly rate we can find on the listing payload, if any. */
// const minPrice = (hostel) => {
//   const direct = Number(hostel.min_price ?? hostel.starting_price ?? hostel.price_per_night);
//   if (direct > 0) return direct;
//   const rooms = safeParse(hostel.room_types);
//   const prices = rooms.map((r) => Number(r.price_per_night)).filter((p) => p > 0);
//   return prices.length ? Math.min(...prices) : null;
// };

// export default function HostelCard({ hostel, viewMode = 'list', searchQuery = '' }) {
//   const photos = safeParse(hostel.photos);
//   const hasPhotos = photos.length > 0;
//   const rating = Number(hostel.rating) || 0;
//   const reviews = hostel.total_reviews || 0;
//   const amenities = safeParse(hostel.amenities).slice(0, 4);
//   const from = minPrice(hostel);
//   const detailUrl = `/hostels/${hostel.id}${searchQuery ? `?${searchQuery}` : ''}`;

//   const Photo = ({ className }) => (
//     <div className={className}>
//       {hasPhotos ? (
//         <img
//           src={resolveUploadUrl(photos[0].photo_url)}
//           alt={hostel.name}
//           loading="lazy"
//           onError={(e) => {
//             e.target.style.display = 'none';
//           }}
//         />
//       ) : (
//         <div className="tz-card-noimg">
//           <Image size={36} />
//         </div>
//       )}
//     </div>
//   );

//   const ScorePlate = () => (
//     <div className="tz-score">
//       <div className="tz-score-text">
//         <strong>{scoreWord(rating)}</strong>
//         <span>{reviews > 0 ? `${reviews} review${reviews === 1 ? '' : 's'}` : 'No reviews yet'}</span>
//       </div>
//       <span className="tz-score-plate">{rating > 0 ? rating.toFixed(1) : '—'}</span>
//     </div>
//   );

//   const PriceBlock = ({ align = 'end' }) => (
//     <div className="tz-card-price" style={{ textAlign: align === 'end' ? 'right' : 'left' }}>
//       {from ? (
//         <>
//           <span className="tz-price-label">From</span>
//           <span className="tz-price-value">Rs {Number(from).toLocaleString()}</span>
//           <span className="tz-price-label">per night</span>
//         </>
//       ) : (
//         <span className="tz-price-label">See rooms for prices</span>
//       )}
//     </div>
//   );

//   if (viewMode === 'list') {
//     return (
//       <Link to={detailUrl} className="tz-card tz-card--list">
//         <Photo className="tz-card-media tz-card-media--list" />
//         <div className="tz-card-main">
//           <div className="tz-card-head">
//             <div>
//               <h3 className="tz-card-name">{hostel.name}</h3>
//               <p className="tz-card-loc">
//                 <MapPin size={13} /> {hostel.city}
//                 {hostel.state ? `, ${hostel.state}` : ''} · {hostel.property_type || 'Hostel'}
//               </p>
//             </div>
//             <ScorePlate />
//           </div>

//           {amenities.length > 0 && (
//             <div className="tz-card-amenities">
//               {amenities.map((a) => {
//                 const Icon = AMENITY_ICONS[a] || Check;
//                 return (
//                   <span key={a} className="tz-chip tz-chip--soft">
//                     <Icon size={12} /> {String(a).replace(/_/g, ' ')}
//                   </span>
//                 );
//               })}
//             </div>
//           )}

//           <div className="tz-card-foot">
//             <span className="tz-freetext">Free cancellation options · Pay at property</span>
//             <div className="tz-card-cta">
//               <PriceBlock />
//               <span className="tz-btn tz-btn--primary tz-btn--sm">See availability</span>
//             </div>
//           </div>
//         </div>
//       </Link>
//     );
//   }

//   // grid variant
//   return (
//     <Link to={detailUrl} className="tz-card tz-card--grid">
//       <div className="tz-card-media tz-card-media--grid">
//         <Photo className="tz-card-media-inner" />
//         <span className="tz-card-citytag">
//           <MapPin size={11} /> {hostel.city}
//         </span>
//         {rating > 0 && <span className="tz-score-plate tz-score-plate--float">{rating.toFixed(1)}</span>}
//       </div>
//       <div className="tz-card-body">
//         <h3 className="tz-card-name">{hostel.name}</h3>
//         <p className="tz-card-loc">
//           {hostel.property_type || 'Hostel'} · {hostel.total_rooms || '—'} rooms
//         </p>
//         <div className="tz-card-foot">
//           <span className="tz-freetext">{reviews > 0 ? `${reviews} reviews` : 'New listing'}</span>
//           <PriceBlock />
//         </div>
//       </div>
//     </Link>
//   );
// }



import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Heart, RotateCcw } from 'lucide-react';
import { resolveUploadUrl } from '../api/client';

export default function HostelCard({ hostel, viewMode = 'grid', index = 0 }) {
  const hasPhotos = hostel.photos && hostel.photos.length > 0;
  const rating = Number(hostel.rating || 0);
  const has360 = hostel.has_360 || (hostel.photos && hostel.photos.some(p => p.is_360));

  const cardStyle = {
    animationDelay: `${index * 0.08}s`
  };

  const getImageUrl = () => {
    if (hasPhotos && hostel.photos[0]?.photo_url) {
      const url = resolveUploadUrl(hostel.photos[0].photo_url);
      console.log('🖼️ Image URL for', hostel.name, ':', url);
      return url;
    }
    return null;
  };

  const imageUrl = getImageUrl();

  const renderImage = () => {
    if (imageUrl) {
      return (
        <img 
          src={imageUrl} 
          alt={hostel.name}
          loading="lazy"
          onError={(e) => {
            console.error('❌ Image failed to load:', imageUrl);
            e.target.style.display = 'none';
          }}
        />
      );
    }
    return (
      <div className="no-image">
        <span>📸</span>
      </div>
    );
  };

  if (viewMode === 'list') {
    return (
      <Link to={`/hostels/${hostel.id}`} className="hostel-card list-view" style={cardStyle}>
        <div className="hostel-card-image">
          {renderImage()}
          <div className="badge">{hostel.property_type || 'Hostel'}</div>
          {has360 && (
            <div className="badge-360">
              <RotateCcw size={12} /> 360°
            </div>
          )}
        </div>
        <div className="hostel-card-body">
          <div className="card-header">
            <h3>{hostel.name}</h3>
            <button className="wishlist-btn" onClick={(e) => e.preventDefault()}>
              <Heart size={18} />
            </button>
          </div>
          <div className="location">
            <MapPin size={14} /> {hostel.city}, {hostel.state || 'Pakistan'}
          </div>
          <div className="rating">
            <Star size={14} fill="#f59e0b" /> {rating.toFixed(1)} ({hostel.total_reviews || 0} reviews)
          </div>
          <div className="price-section">
            <span className="price">Rs. {hostel.minPrice || 'Contact'}</span>
            <span className="per-night">/ night</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/hostels/${hostel.id}`} className="hostel-card" style={cardStyle}>
      <div className="hostel-card-image">
        {renderImage()}
        <div className="badge">{hostel.property_type || 'Hostel'}</div>
        {has360 && (
          <div className="badge-360">
            <RotateCcw size={12} /> 360°
          </div>
        )}
      </div>
      <div className="hostel-card-body">
        <div className="card-header">
          <h3>{hostel.name}</h3>
          <button className="wishlist-btn" onClick={(e) => e.preventDefault()}>
            <Heart size={18} />
          </button>
        </div>
        <div className="location">
          <MapPin size={14} /> {hostel.city}
        </div>
        <div className="rating">
          <Star size={14} fill="#f59e0b" /> {rating.toFixed(1)}
        </div>
        <div className="price-section">
          <span className="price">Rs. {hostel.minPrice || 'Contact'}</span>
          <span className="per-night">/ night</span>
        </div>
      </div>
    </Link>
  );
}