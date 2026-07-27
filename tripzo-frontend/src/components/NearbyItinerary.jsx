import { useState } from 'react';
import { getHostelItinerary } from '../api/hostels';
import { apiErrorMessage } from '../api/client';
import { Compass, MapPin, Sparkles, Calendar } from 'lucide-react';

export default function NearbyItinerary({ hostelId }) {
  const [durationDays, setDurationDays] = useState(3);
  const [interests, setInterests] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getHostelItinerary(hostelId, durationDays, interests);
      setResult(data.data);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not generate an itinerary right now.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card card-pad">
      <h4 style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Compass size={18} /> Nearby attractions & AI itinerary
      </h4>
      <p className="muted" style={{ marginBottom: 14 }}>
        Gemini-suggested places to visit near this stay, plus a day-by-day plan.
      </p>

      <div className="form-grid" style={{ marginBottom: 4 }}>
        <div className="field">
          <label>Trip length (days)</label>
          <input
            type="number"
            min={1}
            max={14}
            value={durationDays}
            onChange={(e) => setDurationDays(Number(e.target.value) || 1)}
          />
        </div>
        <div className="field">
          <label>Interests (optional)</label>
          <input
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="hiking, food, history…"
          />
        </div>
      </div>

      <button className="btn btn-primary btn-sm" onClick={generate} disabled={loading}>
        <Sparkles size={14} /> {loading ? 'Planning…' : 'Generate itinerary'}
      </button>

      {error && <div className="alert alert-error" style={{ marginTop: 14 }}>{error}</div>}

      {result && (
        <div style={{ marginTop: 20 }}>
          {Array.isArray(result.attractions) && result.attractions.length > 0 && (
            <>
              <h5 style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={15} /> Places to visit
              </h5>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10, marginBottom: 20 }}>
                {result.attractions.map((place, i) => (
                  <div key={i} className="stat-card" style={{ textAlign: 'left', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                      <strong style={{ fontSize: 14 }}>{place.name}</strong>
                      {place.category && (
                        <span className="stamp stamp-info" style={{ flexShrink: 0, fontSize: 10 }}>{place.category}</span>
                      )}
                    </div>
                    <p className="muted" style={{ fontSize: 12.5, margin: '6px 0' }}>{place.description}</p>
                    <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', display: 'flex', gap: 10 }}>
                      {place.distance_km != null && <span>{place.distance_km} km away</span>}
                      {place.suggested_duration && <span>{place.suggested_duration}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {Array.isArray(result.itinerary) && result.itinerary.length > 0 && (
            <>
              <h5 style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={15} /> Suggested itinerary
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {result.itinerary.map((day) => (
                  <div key={day.day} style={{ padding: '10px 14px', background: 'var(--paper-dim)', borderRadius: 8 }}>
                    <strong style={{ fontSize: 13.5 }}>Day {day.day}: {day.title}</strong>
                    {Array.isArray(day.activities) && (
                      <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 13, color: 'var(--text-secondary)' }}>
                        {day.activities.map((act, i) => <li key={i}>{act}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
