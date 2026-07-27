import React, { useState } from 'react';
import { Check, X, Calendar, Users, DollarSign, Package } from 'lucide-react';
import toast from 'react-hot-toast';

// pkg.includes comes from the API as a JSON string, but can be malformed,
// already-parsed, or missing — never let it crash the whole page.
const safeIncludes = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const HotelPackages = ({ packages, hostelId, onBook }) => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [bookingDates, setBookingDates] = useState({
    check_in: '',
    check_out: ''
  });

  const handleBook = async () => {
    if (!bookingDates.check_in || !bookingDates.check_out) {
      toast.error('Please select dates');
      return;
    }
    if (onBook) {
      await onBook(selectedPackage, bookingDates);
    }
    setSelectedPackage(null);
  };

  if (!packages || packages.length === 0) {
    return (
      <div className="card card-pad" style={{ textAlign: 'center', padding: '40px' }}>
        <Package size={40} color="var(--text-muted)" />
        <p className="muted" style={{ marginTop: 12 }}>No packages available for this hostel.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Package size={20} /> Hotel Packages
      </h3>
      {packages.map((pkg) => (
        <div key={pkg.id} className="card card-pad">
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ marginBottom: 4 }}>{pkg.name}</h4>
              <p className="muted">{pkg.description}</p>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                  <Calendar size={14} /> {pkg.duration_days} days
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                  <Users size={14} /> Up to 2 guests
                </span>
              </div>
              {safeIncludes(pkg.includes).length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Includes:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {safeIncludes(pkg.includes).map((item, idx) => (
                      <span key={`${item}-${idx}`} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2, 
                        fontSize: 12, 
                        background: 'var(--success-light)', 
                        padding: '2px 10px', 
                        borderRadius: '4px',
                        color: 'var(--success)'
                      }}>
                        <Check size={12} /> {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right', minWidth: 150 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--clay)' }}>
                Rs. {pkg.price}
              </div>
              <button 
                className="btn btn-primary btn-sm" 
                onClick={() => setSelectedPackage(pkg.id)}
                style={{ marginTop: 8 }}
              >
                Book Package
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Booking Modal */}
      {selectedPackage && (
        <div className="modal-overlay" onClick={() => setSelectedPackage(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16 }}>Book Package</h3>
            <div className="field">
              <label>Check-in Date</label>
              <input 
                type="date" 
                value={bookingDates.check_in}
                onChange={(e) => setBookingDates({...bookingDates, check_in: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="field">
              <label>Check-out Date</label>
              <input 
                type="date" 
                value={bookingDates.check_out}
                onChange={(e) => setBookingDates({...bookingDates, check_out: e.target.value})}
                min={bookingDates.check_in || new Date().toISOString().split('T')[0]}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setSelectedPackage(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleBook}>
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelPackages;