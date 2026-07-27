import React, { useState } from 'react';
import { Check, X, Calendar, Users, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const HotelPackages = ({ packages, hostelId }) => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [bookingDates, setBookingDates] = useState({
    check_in: '',
    check_out: ''
  });

  const handleBookPackage = async () => {
    if (!bookingDates.check_in || !bookingDates.check_out) {
      toast.error('Please select dates');
      return;
    }
    toast.success('Package booked!');
  };

  if (!packages || packages.length === 0) {
    return (
      <div className="card card-pad" style={{ textAlign: 'center', padding: '40px' }}>
        <p className="muted">No packages available for this hostel.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 className="section-title">Hotel Packages</h3>
      {packages.map((pkg) => (
        <div key={pkg.id} className="card card-pad">
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h4 style={{ marginBottom: 4 }}>{pkg.name}</h4>
              <p className="muted">{pkg.description}</p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={14} /> {pkg.duration_days} days
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <DollarSign size={14} /> Rs. {pkg.price}
                </span>
              </div>
              {pkg.includes && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Includes:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {JSON.parse(pkg.includes).map((item) => (
                      <span key={item} style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 12, background: 'var(--success-light)', padding: '2px 8px', borderRadius: '4px' }}>
                        <Check size={12} /> {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right', minWidth: 150 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--clay)' }}>
                Rs. {pkg.price}
              </div>
              <button 
                className="btn btn-primary btn-sm" 
                onClick={() => setSelectedPackage(pkg.id)}
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
              />
            </div>
            <div className="field">
              <label>Check-out Date</label>
              <input 
                type="date" 
                value={bookingDates.check_out}
                onChange={(e) => setBookingDates({...bookingDates, check_out: e.target.value})}
              />
            </div>
            <button className="btn btn-primary btn-block" onClick={handleBookPackage}>
              Confirm Booking
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelPackages;