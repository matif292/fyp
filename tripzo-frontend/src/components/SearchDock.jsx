import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Search } from 'lucide-react';

/**
 * SearchDock — the combined search bar (destination + dates + guests).
 * Used on the Landing hero and as a compact sticky bar on the Hostels page.
 * Pushes everything into URL params so the whole journey
 * (Landing → Hostels → HostelDetail → BookingForm) keeps the same context.
 */
export default function SearchDock({ initial = {}, compact = false, onSearch }) {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    city: initial.city || '',
    checkIn: initial.checkIn || '',
    checkOut: initial.checkOut || '',
    guests: initial.guests || '',
  });

  const set = (key) => (e) => {
    const value = e.target.value;
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // keep check-out after check-in
      if (key === 'checkIn' && next.checkOut && next.checkOut <= value) {
        next.checkOut = '';
      }
      return next;
    });
  };

  const submit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (form.city.trim()) params.set('city', form.city.trim());
    if (form.checkIn) params.set('checkIn', form.checkIn);
    if (form.checkOut) params.set('checkOut', form.checkOut);
    if (form.guests) params.set('guests', form.guests);

    if (onSearch) {
      onSearch(Object.fromEntries(params.entries()));
    } else {
      navigate(`/hostels?${params.toString()}`);
    }
  };

  return (
    <form className={`tz-dock ${compact ? 'tz-dock--compact' : ''}`} onSubmit={submit}>
      <label className="tz-dock-field tz-dock-field--grow">
        <MapPin size={17} className="tz-dock-icon" />
        <span className="tz-dock-label">Where to</span>
        <input
          type="text"
          placeholder="Hunza, Skardu, Swat…"
          value={form.city}
          onChange={set('city')}
        />
      </label>

      <span className="tz-dock-divider" />

      <label className="tz-dock-field">
        <Calendar size={17} className="tz-dock-icon" />
        <span className="tz-dock-label">Check-in</span>
        <input type="date" min={today} value={form.checkIn} onChange={set('checkIn')} />
      </label>

      <span className="tz-dock-divider" />

      <label className="tz-dock-field">
        <Calendar size={17} className="tz-dock-icon" />
        <span className="tz-dock-label">Check-out</span>
        <input
          type="date"
          min={form.checkIn || today}
          value={form.checkOut}
          onChange={set('checkOut')}
        />
      </label>

      <span className="tz-dock-divider" />

      <label className="tz-dock-field tz-dock-field--guests">
        <Users size={17} className="tz-dock-icon" />
        <span className="tz-dock-label">Guests</span>
        <input
          type="number"
          min={1}
          max={20}
          placeholder="2"
          value={form.guests}
          onChange={set('guests')}
        />
      </label>

      <button className="tz-dock-btn" type="submit">
        <Search size={17} />
        <span>Search</span>
      </button>
    </form>
  );
}
