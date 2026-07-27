import { useState } from 'react';
import { sendNegotiation } from '../api/negotiations';
import { apiErrorMessage } from '../api/client';
import { HeartHandshake, X, Info, Lightbulb, Lock, Send, MapPin, BedDouble } from 'lucide-react';

/**
 * Negotiation modal — Figure 5.8 style.
 * Listed price with strike-through vs your offer, a live "% Off" badge,
 * quick-offer chips (-5% / -10% / -15%), a trip summary bar, and a tips strip.
 */
export default function NegotiationModal({ hostel, roomType, onClose }) {
  const listed = Number(roomType.price_per_night) || 0;
  const suggestedMin = Math.round(listed * 0.75); // guidance only — owner decides

  const [form, setForm] = useState({
    offered_price: '',
    check_in_date: '',
    check_out_date: '',
    total_guests: 1,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const offer = Number(form.offered_price) || 0;
  const offPct = listed > 0 && offer > 0 ? Math.round(((listed - offer) / listed) * 100) : null;
  const tooLow = offPct != null && offPct > 25;

  const applyPct = (pct) => {
    setForm((f) => ({ ...f, offered_price: String(Math.round(listed * (1 - pct / 100))) }));
  };

  const activePct = (pct) => offer > 0 && offer === Math.round(listed * (1 - pct / 100));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await sendNegotiation({
        hostel_id: hostel.id,
        room_type_id: roomType.id,
        offered_price: offer,
        check_in_date: form.check_in_date,
        check_out_date: form.check_out_date,
        total_guests: Number(form.total_guests) || 1,
      });
      setResult(data);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not submit your offer.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box tz-reveal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <div>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <HeartHandshake size={18} /> Negotiate your price
            </h3>
            <p className="muted" style={{ fontSize: 12.5, margin: '2px 0 0' }}>
              Make an offer and get an instant accept, counter or reject.
            </p>
          </div>
          <button className="btn btn-sm btn-outline" onClick={onClose} aria-label="Close"><X size={14} /></button>
        </div>

        {!result ? (
          <form onSubmit={submit}>
            {(form.check_in_date || form.check_out_date) && (
              <div className="ngx-trip" style={{ marginTop: 12 }}>
                <Info size={14} />
                Your trip: {form.check_in_date || '…'} – {form.check_out_date || '…'} · {form.total_guests || 1} guest{Number(form.total_guests) > 1 ? 's' : ''}
              </div>
            )}

            <div className="ngx-row" style={{ marginTop: form.check_in_date || form.check_out_date ? 0 : 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="ngx-room-name">{hostel.name}</div>
                <div className="ngx-room-meta"><BedDouble size={12} /> {roomType.name}</div>
                {hostel.city && <div className="ngx-room-meta"><MapPin size={12} /> {hostel.city}</div>}
              </div>
              <div style={{ textAlign: 'right' }}>
                {offer > 0 && offer < listed && (
                  <div className="ngx-price-strike">Rs. {listed.toLocaleString()}</div>
                )}
                <div className="ngx-price">Rs. {listed.toLocaleString()} <span style={{ fontWeight: 500, fontSize: 11.5, color: 'var(--gray-500)' }}>/night</span></div>
              </div>
              {offPct != null && offPct > 0 && (
                <div className={`ngx-off${tooLow ? ' bad' : ''}`}>
                  {offPct}%<br />Off
                </div>
              )}
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="field">
              <label>Your offer (Rs. per night)</label>
              <input
                type="number"
                required
                min={1}
                value={form.offered_price}
                onChange={(e) => setForm({ ...form, offered_price: e.target.value })}
                placeholder={`e.g. ${suggestedMin.toLocaleString()}`}
              />
              <div className="ngx-quick">
                {[5, 10, 15].map((p) => (
                  <button
                    type="button"
                    key={p}
                    className={`ngx-chip${activePct(p) ? ' on' : ''}`}
                    onClick={() => applyPct(p)}
                  >
                    −{p}% · Rs. {Math.round(listed * (1 - p / 100)).toLocaleString()}
                  </button>
                ))}
              </div>
              <div className="ngx-min">
                {tooLow
                  ? 'Offers more than ~25% below the listed price are usually rejected.'
                  : `Tip: offers around Rs. ${suggestedMin.toLocaleString()}+ have the best chance.`}
              </div>
            </div>

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

            <div className="ngx-tips">
              <Lightbulb size={14} style={{ flex: '0 0 auto', marginTop: 1 }} />
              <span><strong>Tips:</strong> hosts respond to your offer instantly by rule, or counter it. You can accept, counter or cancel anytime from My Negotiations.</span>
            </div>

            <button className="btn btn-primary btn-block" disabled={loading} type="submit">
              <Send size={14} /> {loading ? 'Sending…' : offer > 0 ? `Send offer · Rs. ${offer.toLocaleString()}/night` : 'Send offer'}
            </button>

            <div className="ngx-secure"><Lock size={12} /> Your offers are secure and private.</div>
          </form>
        ) : (
          <div style={{ marginTop: 12 }}>
            <div
              className="alert tz-reveal"
              style={{
                background: result.data.status === 'accepted' ? 'var(--success-light)' : result.data.status === 'rejected' ? 'var(--danger-light)' : 'var(--info-light)',
                color: result.data.status === 'accepted' ? '#065f46' : result.data.status === 'rejected' ? '#991b1b' : '#1e40af',
              }}
            >
              {result.message}
            </div>
            {result.data.status === 'counter' && (
              <p className="muted" style={{ fontSize: 13 }}>
                Head to <strong>My negotiations</strong> to accept this counter-offer before it expires.
              </p>
            )}
            <button className="btn btn-outline btn-block" onClick={onClose} style={{ marginTop: 10 }}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}
