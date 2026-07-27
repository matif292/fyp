import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Loader, EmptyState, Alert } from '../../components/Feedback';
import { getMyNegotiations, acceptCounter } from '../../api/negotiations';
import { apiErrorMessage } from '../../api/client';
import { HeartHandshake, MapPin, Check } from 'lucide-react';
import { travelerStops } from './travelerStops.jsx';
import toast from 'react-hot-toast';

const STATUS_STAMP = {
  pending: 'stamp-pending',
  counter: 'stamp-info',
  accepted: 'stamp-confirmed',
  counter_accepted: 'stamp-confirmed',
  rejected: 'stamp-cancelled',
  expired: 'stamp-cancelled',
  cancelled: 'stamp-cancelled',
};

const STATUS_LABEL = {
  pending: 'Awaiting owner',
  counter: 'Countered',
  accepted: 'Accepted',
  counter_accepted: 'Accepted',
  rejected: 'Rejected',
  expired: 'Expired',
  cancelled: 'Cancelled',
};

export default function MyNegotiations() {
  const [negotiations, setNegotiations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getMyNegotiations();
      setNegotiations(data.data || []);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load your offers.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAcceptCounter = async (id) => {
    setBusyId(id);
    try {
      await acceptCounter(id);
      toast.success('Counter-offer accepted — booking confirmed!');
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not accept this counter-offer.'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardLayout stops={travelerStops} roleLabel="Traveler">
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">Price negotiation</span>
          <h1 style={{ margin: 0 }}>My offers</h1>
        </div>
      </div>

      <Alert>{error}</Alert>

      {loading && <Loader />}
      {!loading && negotiations.length === 0 && (
        <EmptyState title="No offers yet" hint="Make an offer on a room from a hostel's Rooms tab and it'll show up here." />
      )}
      {!loading && negotiations.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {negotiations.map((n) => (
            <div key={n.id} className="card card-pad">
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <HeartHandshake size={15} />
                    <strong>{n.hostel_name}</strong>
                    <span className={`stamp ${STATUS_STAMP[n.status] || 'stamp-pending'}`}>{STATUS_LABEL[n.status] || n.status}</span>
                  </div>
                  <p className="muted" style={{ margin: '4px 0 0', fontSize: 13 }}>
                    <MapPin size={12} style={{ verticalAlign: -1 }} /> {n.city} — {n.room_type_name}
                  </p>
                  <p className="muted" style={{ margin: '4px 0 0', fontSize: 13 }}>
                    {n.check_in_date?.slice(0, 10)} → {n.check_out_date?.slice(0, 10)} · {n.total_guests} guest{n.total_guests === 1 ? '' : 's'}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="muted" style={{ fontSize: 12 }}>Listed Rs. {Number(n.system_price).toLocaleString()}/night</div>
                  <div style={{ fontWeight: 700 }}>Your offer: Rs. {Number(n.offered_price).toLocaleString()}/night</div>
                  {n.status === 'counter' && n.counter_offer && (
                    <>
                      <div style={{ color: 'var(--info)', fontWeight: 700, marginTop: 4 }}>
                        Counter: Rs. {Number(n.counter_offer).toLocaleString()}/night
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ marginTop: 8 }}
                        disabled={busyId === n.id}
                        onClick={() => handleAcceptCounter(n.id)}
                      >
                        <Check size={13} /> Accept counter
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
