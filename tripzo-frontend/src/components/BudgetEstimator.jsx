import { useState } from 'react';
import { getBudgetRecommendations, saveBudgetPreference } from '../api/budget';
import { apiErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Wallet, Sparkles, Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';

const BUDGET_TYPES = [
  { value: 'budget', label: 'Budget' },
  { value: 'mid-range', label: 'Mid-range' },
  { value: 'luxury', label: 'Luxury' },
];

export default function BudgetEstimator({ destination }) {
  const { isAuthenticated } = useAuth();
  const [durationDays, setDurationDays] = useState(3);
  const [budgetType, setBudgetType] = useState('mid-range');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const estimate = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getBudgetRecommendations(destination, durationDays, budgetType);
      setResult(data.data);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not get a budget estimate right now.'));
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    try {
      await saveBudgetPreference({ destination, duration_days: durationDays, budget_type: budgetType, recommendations: result });
      toast.success('Saved to your budget preferences');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not save this estimate.'));
    }
  };

  return (
    <div className="card card-pad">
      <h4 style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Wallet size={18} /> AI trip budget estimate
      </h4>
      <p className="muted" style={{ marginBottom: 14 }}>
        Gemini-powered cost breakdown for a stay in {destination}.
      </p>

      <div className="form-grid" style={{ marginBottom: 4 }}>
        <div className="field">
          <label>Nights</label>
          <input
            type="number"
            min={1}
            max={30}
            value={durationDays}
            onChange={(e) => setDurationDays(Number(e.target.value) || 1)}
          />
        </div>
        <div className="field">
          <label>Budget type</label>
          <select value={budgetType} onChange={(e) => setBudgetType(e.target.value)}>
            {BUDGET_TYPES.map((b) => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
        </div>
      </div>

      <button className="btn btn-primary btn-sm" onClick={estimate} disabled={loading}>
        <Sparkles size={14} /> {loading ? 'Estimating…' : 'Get AI estimate'}
      </button>

      {error && <div className="alert alert-error" style={{ marginTop: 14 }}>{error}</div>}

      {result && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span className="muted">Estimated total</span>
            <strong style={{ fontSize: 22, color: 'var(--clay)' }}>
              {result.currency || 'PKR'} {Number(result.total_estimated || 0).toLocaleString()}
            </strong>
          </div>

          {result.breakdown && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 12 }}>
              {Object.entries(result.breakdown).map(([key, value]) => (
                <div key={key} className="stat-card" style={{ padding: '10px 12px' }}>
                  <div className="stat-value" style={{ fontSize: 16 }}>Rs. {Number(value).toLocaleString()}</div>
                  <div className="stat-label" style={{ textTransform: 'capitalize' }}>{key}</div>
                </div>
              ))}
            </div>
          )}

          {Array.isArray(result.tips) && result.tips.length > 0 && (
            <ul style={{ marginTop: 14, paddingLeft: 18, fontSize: 13, color: 'var(--text-secondary)' }}>
              {result.tips.map((tip, i) => <li key={i} style={{ marginBottom: 4 }}>{tip}</li>)}
            </ul>
          )}

          {isAuthenticated && (
            <button className="btn btn-outline btn-sm" style={{ marginTop: 12 }} onClick={save}>
              <Bookmark size={14} /> Save this estimate
            </button>
          )}
        </div>
      )}
    </div>
  );
}
