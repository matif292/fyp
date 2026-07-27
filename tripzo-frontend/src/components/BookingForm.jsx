import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createBooking } from '../api/bookings';
import { apiErrorMessage } from '../api/client';
import { ShieldCheck, CreditCard, Wallet, Banknote, Landmark, CheckCircle2, BadgeCheck } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Sticky booking card.
 * - Prefills from the search context (dates/guests carried in the URL).
 * - `selectedRoomId` lets the Rooms table "Reserve" buttons pick the room here.
 * - Shows an itemized breakdown before the CTA (nights × rate = total).
 */
const BookingForm = ({ hostelId, roomTypes, initial = {}, selectedRoomId }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    room_type_id: roomTypes?.[0]?.id || '',
    check_in_date: initial.checkIn || '',
    check_out_date: initial.checkOut || '',
    total_guests: Number(initial.guests) || 1,
    special_requests: '',
  });
  const [payment, setPayment] = useState('Pay at property');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Sync when a Reserve button in the rooms table selects a room
  useEffect(() => {
    if (selectedRoomId) {
      setForm((prev) => ({ ...prev, room_type_id: selectedRoomId }));
      setErrors((prev) => ({ ...prev, room_type_id: '' }));
    }
  }, [selectedRoomId]);

  const validate = () => {
    const newErrors = {};
    if (!form.room_type_id) newErrors.room_type_id = 'Please select a room type';
    if (!form.check_in_date) newErrors.check_in_date = 'Please select a check-in date';
    if (!form.check_out_date) newErrors.check_out_date = 'Please select a check-out date';
    if (form.check_in_date && form.check_out_date) {
      if (new Date(form.check_out_date) <= new Date(form.check_in_date)) {
        newErrors.check_out_date = 'Check-out must be after check-in';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in to book');
      navigate('/login', { state: { from: `/hostels/${hostelId}` } });
      return;
    }
    if (user?.role !== 'traveler') {
      toast.error('Only travelers can make bookings');
      return;
    }
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await createBooking({
        hostel_id: parseInt(hostelId),
        room_type_id: parseInt(form.room_type_id),
        check_in_date: form.check_in_date,
        check_out_date: form.check_out_date,
        total_guests: parseInt(form.total_guests),
        special_requests: [form.special_requests, payment ? `Payment preference: ${payment}` : '']
          .filter(Boolean)
          .join(' | '),
      });
      if (response.data.success) {
        toast.success('Booking confirmed!');
        navigate('/account/bookings');
      }
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Failed to create booking'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const selectedRoom = roomTypes?.find((r) => r.id === parseInt(form.room_type_id));
  const nights =
    form.check_in_date && form.check_out_date
      ? Math.ceil(
          (new Date(form.check_out_date) - new Date(form.check_in_date)) / (1000 * 60 * 60 * 24)
        )
      : 0;
  const total = selectedRoom && nights > 0 ? nights * selectedRoom.price_per_night : null;

  if (!roomTypes || roomTypes.length === 0) {
    return (
      <div className="tz-bookcard" id="booking-form">
        <p className="tz-freetext">No room types available for booking yet.</p>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="tz-bookcard" id="booking-form">
      <div className="tz-bookcard-head">
        <h3>Book this stay</h3>
        {selectedRoom && (
          <span className="tz-price-value">
            Rs {Number(selectedRoom.price_per_night).toLocaleString()}
            <small> /night</small>
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bk-step"><span className="n">1.</span> Room details</div>
        <div className="field">
          <label>Room type</label>
          <select
            name="room_type_id"
            value={form.room_type_id}
            onChange={handleChange}
            className={errors.room_type_id ? 'error' : ''}
          >
            <option value="">Select a room type</option>
            {roomTypes.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name} — Rs {Number(room.price_per_night).toLocaleString()}/night
              </option>
            ))}
          </select>
          {errors.room_type_id && <div className="field-error">{errors.room_type_id}</div>}
        </div>

        <div className="bk-step"><span className="n">2.</span> Stay details</div>
        <div className="form-grid">
          <div className="field">
            <label>Check-in</label>
            <input
              type="date"
              name="check_in_date"
              value={form.check_in_date}
              onChange={handleChange}
              min={today}
              className={errors.check_in_date ? 'error' : ''}
            />
            {errors.check_in_date && <div className="field-error">{errors.check_in_date}</div>}
          </div>
          <div className="field">
            <label>Check-out</label>
            <input
              type="date"
              name="check_out_date"
              value={form.check_out_date}
              onChange={handleChange}
              min={form.check_in_date || today}
              className={errors.check_out_date ? 'error' : ''}
            />
            {errors.check_out_date && <div className="field-error">{errors.check_out_date}</div>}
          </div>
        </div>

        <div className="field">
          <label>Guests</label>
          <input
            type="number"
            name="total_guests"
            min={1}
            max={selectedRoom?.capacity || 10}
            value={form.total_guests}
            onChange={handleChange}
          />
          {selectedRoom?.capacity && (
            <div className="tz-fieldhint">This room sleeps up to {selectedRoom.capacity}</div>
          )}
        </div>

        <div className="bk-step"><span className="n">3.</span> Additional requests <span style={{ fontWeight: 500, color: 'var(--gray-500)' }}>(optional)</span></div>
        <div className="field">
          <label className="sr-only" style={{ display: 'none' }}>Special requests</label>
          <textarea
            name="special_requests"
            value={form.special_requests}
            onChange={handleChange}
            placeholder="Early check-in, extra bedding…"
            rows={2}
          />
        </div>

        <div className="bk-step"><span className="n">4.</span> Payment method</div>
        <div className="bk-pay">
          {[
            { label: 'Pay at property', icon: <Banknote size={15} /> },
            { label: 'Credit / Debit Card', icon: <CreditCard size={15} /> },
            { label: 'EasyPaisa', icon: <Wallet size={15} /> },
            { label: 'JazzCash', icon: <Landmark size={15} /> },
          ].map((opt) => (
            <button
              type="button"
              key={opt.label}
              className={`bk-pay-opt${payment === opt.label ? ' on' : ''}`}
              onClick={() => setPayment(opt.label)}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>

        {total && (
          <div className="tz-breakdown">
            <div className="tz-breakdown-row">
              <span>
                Rs {Number(selectedRoom.price_per_night).toLocaleString()} × {nights} night
                {nights === 1 ? '' : 's'}
              </span>
              <span>Rs {total.toLocaleString()}</span>
            </div>
            <div className="tz-breakdown-row">
              <span>Taxes & fees</span>
              <span>Included</span>
            </div>
            <div className="tz-breakdown-row tz-breakdown-row--total">
              <span>Total</span>
              <span>Rs {total.toLocaleString()}</span>
            </div>
          </div>
        )}

        <button className="tz-btn tz-btn--primary tz-btn--block" type="submit" disabled={loading}>
          {loading ? 'Processing…' : total ? `Reserve · Rs ${total.toLocaleString()}` : 'Check availability'}
        </button>

        <p className="tz-booknote">
          <ShieldCheck size={13} /> Your booking details are secure and encrypted.
        </p>

        {form.check_in_date && (
          <div className="bk-cancel">
            <BadgeCheck size={18} />
            <div>
              <strong>Free Cancellation</strong>
              <span>You can cancel for free before {new Date(form.check_in_date).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}, 11:59 PM.</span>
            </div>
          </div>
        )}

        <ul className="bk-trust">
          <h5>Why book with Tripzo?</h5>
          <li><CheckCircle2 size={14} /> Best price guarantee — negotiate your rate</li>
          <li><CheckCircle2 size={14} /> Verified, document-checked owners</li>
          <li><CheckCircle2 size={14} /> No payment taken now — pay on arrival</li>
          <li><CheckCircle2 size={14} /> Real reviews from completed stays</li>
        </ul>

        {!isAuthenticated && (
          <p className="tz-booknote">
            <Link to="/login">Log in</Link> to complete your booking.
          </p>
        )}
      </form>
    </div>
  );
};

export default BookingForm;
