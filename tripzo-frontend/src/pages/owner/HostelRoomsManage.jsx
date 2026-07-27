import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { Loader, EmptyState, Alert } from '../../components/Feedback';
import { ownerStops } from './OwnerDashboard';
import { getRoomTypes, addRoomType } from '../../api/hostels';
import { apiErrorMessage } from '../../api/client';
import { Plus, X } from 'lucide-react';

const blankRoom = { name: '', description: '', capacity: 2, price_per_night: '', total_rooms: 1 };

export default function HostelRoomsManage() {
  const { hostelId } = useParams();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(blankRoom);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getRoomTypes(hostelId);
      setRooms(data.data || []);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load room types.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hostelId]);

  const openCreate = () => {
    setForm(blankRoom);
    setFormError('');
    setFormOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await addRoomType(hostelId, {
        name: form.name,
        description: form.description,
        capacity: Number(form.capacity),
        price_per_night: Number(form.price_per_night),
        total_rooms: Number(form.total_rooms),
      });
      setFormOpen(false);
      load();
    } catch (err) {
      setFormError(apiErrorMessage(err, 'Could not save this room type.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout stops={ownerStops} roleLabel="Owner">
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">Property #{hostelId}</span>
          <h1 style={{ margin: 0 }}>Room types</h1>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={15} /> Add room type</button>
      </div>

      <p className="muted" style={{ marginTop: -14, marginBottom: 20 }}>
        Room types can be added here but not edited or removed afterward — the API doesn't expose
        those actions yet. Double-check details before saving.
      </p>

      {loading && <Loader />}
      {!loading && error && <EmptyState title="Couldn't load rooms" hint={error} />}
      {!loading && !error && rooms.length === 0 && (
        <EmptyState title="No room types yet" hint="Add pricing tiers travelers can book." />
      )}
      {!loading && !error && rooms.length > 0 && (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Room</th>
                <th>Capacity</th>
                <th>Price / night</th>
                <th>Rooms</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.name}</strong>
                    <div className="muted">{r.description}</div>
                  </td>
                  <td>{r.capacity} guests</td>
                  <td className="mono">Rs. {r.price_per_night}</td>
                  <td className="mono">{r.total_rooms}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <div className="modal-overlay" onClick={() => setFormOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ margin: 0 }}>Add room type</h3>
              <button className="btn btn-sm btn-outline" onClick={() => setFormOpen(false)}><X size={14} /></button>
            </div>
            <Alert>{formError}</Alert>
            <form onSubmit={submit}>
              <div className="field">
                <label>Name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="field">
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-grid">
                <div className="field">
                  <label>Capacity</label>
                  <input type="number" min={1} required value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
                </div>
                <div className="field">
                  <label>Price / night (Rs.)</label>
                  <input type="number" min={0} required value={form.price_per_night} onChange={(e) => setForm({ ...form, price_per_night: e.target.value })} />
                </div>
                <div className="field full">
                  <label>Rooms of this type</label>
                  <input type="number" min={1} required value={form.total_rooms} onChange={(e) => setForm({ ...form, total_rooms: e.target.value })} />
                </div>
              </div>
              <button className="btn btn-primary btn-block" disabled={saving} type="submit">
                {saving ? 'Saving…' : 'Add room type'}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
