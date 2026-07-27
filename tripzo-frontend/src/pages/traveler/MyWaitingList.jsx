import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Loader, EmptyState, Alert } from '../../components/Feedback';
import { getMyWaitingList, removeFromWaitingList } from '../../api/waitingList';
import { apiErrorMessage } from '../../api/client';
import { Bell, MapPin, X } from 'lucide-react';
import { travelerStops } from './travelerStops.jsx';
import toast from 'react-hot-toast';

const STATUS_STAMP = { waiting: 'stamp-pending', notified: 'stamp-confirmed', cancelled: 'stamp-cancelled' };

export default function MyWaitingList() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getMyWaitingList();
      setEntries(data.data || []);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load your waiting list.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    setBusyId(id);
    try {
      await removeFromWaitingList(id);
      toast.success('Removed from waiting list');
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not remove this entry.'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardLayout stops={travelerStops} roleLabel="Traveler">
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">Sold out stays</span>
          <h1 style={{ margin: 0 }}>Waiting list</h1>
        </div>
      </div>

      <Alert>{error}</Alert>

      {loading && <Loader />}
      {!loading && entries.length === 0 && (
        <EmptyState title="Nothing waitlisted" hint="If a room is fully booked, use “Notify me” on its listing and it'll show up here." />
      )}
      {!loading && entries.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {entries.map((w) => (
            <div key={w.id} className="card card-pad">
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Bell size={15} />
                    <strong>{w.hostel_name}</strong>
                    <span className={`stamp ${STATUS_STAMP[w.status] || 'stamp-pending'}`}>
                      {w.status === 'notified' ? 'Spot open!' : w.status === 'cancelled' ? 'Cancelled' : 'Waiting'}
                    </span>
                  </div>
                  <p className="muted" style={{ margin: '4px 0 0', fontSize: 13 }}>
                    <MapPin size={12} style={{ verticalAlign: -1 }} /> {w.city}{w.room_type_name ? ` — ${w.room_type_name}` : ''}
                  </p>
                  <p className="muted" style={{ margin: '4px 0 0', fontSize: 13 }}>
                    {w.check_in_date?.slice(0, 10)} → {w.check_out_date?.slice(0, 10)} · {w.total_guests} guest{w.total_guests === 1 ? '' : 's'}
                  </p>
                </div>
                <button className="btn btn-outline btn-sm" disabled={busyId === w.id} onClick={() => remove(w.id)}>
                  <X size={13} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
