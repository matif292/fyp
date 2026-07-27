import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Loader, EmptyState, Alert } from '../../components/Feedback';
import { getOwnerNegotiations, respondToNegotiation, getNegotiationRules, updateNegotiationRules } from '../../api/negotiations';
import { getOwnerHostels } from '../../api/hostels';
import { apiErrorMessage } from '../../api/client';
import { HeartHandshake, Check, X, Settings } from 'lucide-react';
import { ownerStops } from './OwnerDashboard';
import toast from 'react-hot-toast';

const STATUS_STAMP = {
  pending: 'stamp-pending', counter: 'stamp-info', accepted: 'stamp-confirmed',
  counter_accepted: 'stamp-confirmed', rejected: 'stamp-cancelled', expired: 'stamp-cancelled', cancelled: 'stamp-cancelled',
};

function RulesEditor({ hostels }) {
  const [hostelId, setHostelId] = useState(hostels[0]?.id || '');
  const [rules, setRules] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!hostelId) return;
    getNegotiationRules(hostelId).then(({ data }) => setRules(data.data)).catch(() => setRules(null));
  }, [hostelId]);

  const save = async () => {
    setSaving(true);
    try {
      await updateNegotiationRules(hostelId, rules);
      toast.success('Negotiation rules saved');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not save rules.'));
    } finally {
      setSaving(false);
    }
  };

  if (!hostels.length) return null;

  return (
    <div className="card card-pad" style={{ marginBottom: 24 }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <Settings size={17} /> Negotiation settings
      </h3>
      <p className="muted" style={{ marginBottom: 14 }}>
        Choose how aggressively offers are auto-accepted or auto-countered per listing.
      </p>

      <div className="field">
        <label>Hostel</label>
        <select value={hostelId} onChange={(e) => setHostelId(e.target.value)}>
          {hostels.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
      </div>

      {rules && (
        <>
          <div className="field">
            <label>
              <input
                type="checkbox"
                checked={rules.manual_only}
                onChange={(e) => setRules({ ...rules, manual_only: e.target.checked })}
                style={{ marginRight: 8, width: 'auto' }}
              />
              Review every offer manually (disable auto-accept/counter)
            </label>
          </div>

          {!rules.manual_only && (
            <div className="form-grid">
              <div className="field">
                <label>Auto-accept at (% of listed price)</label>
                <input type="number" min={1} max={100} value={rules.auto_accept_threshold}
                  onChange={(e) => setRules({ ...rules, auto_accept_threshold: e.target.value })} />
              </div>
              <div className="field">
                <label>Auto-counter above (% of listed price)</label>
                <input type="number" min={1} max={100} value={rules.auto_counter_threshold}
                  onChange={(e) => setRules({ ...rules, auto_counter_threshold: e.target.value })} />
              </div>
              <div className="field">
                <label>Counter-offer at (% of listed price)</label>
                <input type="number" min={1} max={100} value={rules.counter_offer_percentage}
                  onChange={(e) => setRules({ ...rules, counter_offer_percentage: e.target.value })} />
              </div>
              <div className="field">
                <label>Minimum counter price (optional)</label>
                <input type="number" value={rules.counter_min_price || ''}
                  onChange={(e) => setRules({ ...rules, counter_min_price: e.target.value || null })} />
              </div>
            </div>
          )}

          <button className="btn btn-primary btn-sm" disabled={saving} onClick={save}>
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        </>
      )}
    </div>
  );
}

export default function OwnerNegotiations() {
  const [negotiations, setNegotiations] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [counterInputs, setCounterInputs] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const [negRes, hostelRes] = await Promise.all([getOwnerNegotiations(), getOwnerHostels()]);
      setNegotiations(negRes.data.data || []);
      setHostels(hostelRes.data.data || []);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load offers.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const respond = async (id, action) => {
    setBusyId(id);
    try {
      const payload = { action };
      if (action === 'counter') payload.counter_offer = Number(counterInputs[id]);
      await respondToNegotiation(id, payload);
      toast.success(action === 'accept' ? 'Offer accepted' : action === 'reject' ? 'Offer rejected' : 'Counter-offer sent');
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not respond to this offer.'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardLayout stops={ownerStops} roleLabel="Owner">
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">Price negotiation</span>
          <h1 style={{ margin: 0 }}>Offers on your stays</h1>
        </div>
      </div>

      <Alert>{error}</Alert>

      {!loading && <RulesEditor hostels={hostels} />}

      {loading && <Loader />}
      {!loading && negotiations.length === 0 && (
        <EmptyState title="No offers yet" hint="When travelers negotiate a price on your listings, they'll show up here." />
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
                    <span className={`stamp ${STATUS_STAMP[n.status] || 'stamp-pending'}`}>{n.status.replace('_', ' ')}</span>
                  </div>
                  <p className="muted" style={{ margin: '4px 0 0', fontSize: 13 }}>
                    {n.room_type_name} · {n.traveler_name} ({n.traveler_email})
                  </p>
                  <p className="muted" style={{ margin: '4px 0 0', fontSize: 13 }}>
                    {n.check_in_date?.slice(0, 10)} → {n.check_out_date?.slice(0, 10)} · {n.total_guests} guest{n.total_guests === 1 ? '' : 's'}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="muted" style={{ fontSize: 12 }}>Listed Rs. {Number(n.system_price).toLocaleString()}/night</div>
                  <div style={{ fontWeight: 700 }}>Offer: Rs. {Number(n.offered_price).toLocaleString()}/night</div>
                </div>
              </div>

              {n.status === 'pending' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  <button className="btn btn-primary btn-sm" disabled={busyId === n.id} onClick={() => respond(n.id, 'accept')}>
                    <Check size={13} /> Accept
                  </button>
                  <button className="btn btn-danger btn-sm" disabled={busyId === n.id} onClick={() => respond(n.id, 'reject')}>
                    <X size={13} /> Reject
                  </button>
                  <input
                    type="number"
                    placeholder="Counter price"
                    style={{ width: 130, padding: '7px 10px', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)' }}
                    value={counterInputs[n.id] || ''}
                    onChange={(e) => setCounterInputs({ ...counterInputs, [n.id]: e.target.value })}
                  />
                  <button
                    className="btn btn-outline btn-sm"
                    disabled={busyId === n.id || !counterInputs[n.id]}
                    onClick={() => respond(n.id, 'counter')}
                  >
                    Send counter
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
