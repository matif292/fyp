import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Loader, EmptyState, Alert } from '../../components/Feedback';
import { getMyReviews, updateReview, deleteReview } from '../../api/reviews';
import { apiErrorMessage } from '../../api/client';
import { Star, Pencil, Trash2, X } from 'lucide-react';
import { travelerStops } from './travelerStops.jsx';

export default function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getMyReviews();
      setReviews(data.data || []);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load your reviews.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (r) => {
    setEditing(r);
    setForm({ rating: r.rating, comment: r.comment || '' });
    setFormError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await updateReview(editing.id, { rating: Number(form.rating), comment: form.comment });
      setEditing(null);
      load();
    } catch (err) {
      setFormError(apiErrorMessage(err, 'Could not update this review.'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await deleteReview(id);
      load();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not delete this review.'));
    }
  };

  return (
    <DashboardLayout stops={travelerStops} roleLabel="Traveler">
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">Your feedback</span>
          <h1 style={{ margin: 0 }}>My reviews</h1>
        </div>
      </div>

      <Alert>{error}</Alert>

      {loading && <Loader />}
      {!loading && reviews.length === 0 && (
        <EmptyState title="No reviews yet" hint="Reviews you leave on confirmed or completed stays show up here." />
      )}
      {!loading && reviews.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reviews.map((r) => (
            <div key={r.id} className="card card-pad">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <strong>{r.hostel_name}</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {r.sentiment_label && (
                    <span className={`stamp ${r.sentiment_label === 'Positive' ? 'stamp-confirmed' : r.sentiment_label === 'Negative' ? 'stamp-cancelled' : 'stamp-pending'}`}>
                      {r.sentiment_label === 'Positive' ? '😊' : r.sentiment_label === 'Negative' ? '😞' : '😐'} {r.sentiment_label}
                    </span>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={13} color="var(--gold)" fill="var(--gold)" /> {r.rating}
                  </span>
                  <button className="btn btn-outline btn-sm" onClick={() => startEdit(r)}><Pencil size={12} /></button>
                  <button className="btn btn-danger btn-sm" onClick={() => remove(r.id)}><Trash2 size={12} /></button>
                </div>
              </div>
              <p style={{ margin: 0 }}>{r.comment}</p>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ margin: 0 }}>Edit review — {editing.hostel_name}</h3>
              <button className="btn btn-sm btn-outline" onClick={() => setEditing(null)}><X size={14} /></button>
            </div>
            <Alert>{formError}</Alert>
            <form onSubmit={submit}>
              <div className="field">
                <label>Rating</label>
                <select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>{n} {'★'.repeat(n)}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Comment</label>
                <textarea required value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
              </div>
              <button className="btn btn-primary btn-block" disabled={saving} type="submit">
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
