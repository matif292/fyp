import { useState } from 'react';
import { joinWaitingList } from '../api/waitingList';
import { apiErrorMessage } from '../api/client';
import { Bell, X } from 'lucide-react';

export default function WaitingListModal({ hostel, roomType, onClose }) {
  const [form, setForm] = useState({ check_in_date: '', check_out_date: '', total_guests: 1 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await joinWaitingList({
        hostel_id: hostel.id,
        room_type_id: roomType.id,
        check_in_date: form.check_in_date,
        check_out_date: form.check_out_date,
        total_guests: Number(form.total_guests) || 1,
      });
      setDone(true);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not join the waiting list.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={18} /> Join waiting list
          </h3>
          <button className="btn btn-sm btn-outline" onClick={onClose}><X size={14} /></button>
        </div>
        <p className="muted" style={{ marginBottom: 14 }}>
          {roomType.name} at {hostel.name}. We'll let you know if a room opens up for these dates.
        </p>

        {done ? (
          <div>
            <div className="alert alert-success">You're on the list! We'll notify you if a spot opens up.</div>
            <button className="btn btn-outline btn-block" onClick={onClose} style={{ marginTop: 10 }}>Close</button>
          </div>
        ) : (
          <form onSubmit={submit}>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-grid">
              <div className="field">
                <label>Check-in</label>
                <input type="date" required value={form.check_in_date} onChange={(e) => setForm({ ...form, check_in_date: e.target.value })} />
              </div>
              <div className="field">
                <label>Check-out</label>
                <input type="date" required value={form.check_out_date} onChange={(e) => setForm({ ...form, check_out_date: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label>Guests</label>
              <input type="number" min={1} value={form.total_guests} onChange={(e) => setForm({ ...form, total_guests: e.target.value })} />
            </div>
            <button className="btn btn-primary btn-block" disabled={loading} type="submit">
              {loading ? 'Joining…' : 'Join waiting list'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
