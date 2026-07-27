import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Loader, EmptyState, Alert } from '../../components/Feedback';
import { adminStops } from './AdminDashboard';
import { getAllHostels, toggleHostelStatus } from '../../api/admin';
import { apiErrorMessage } from '../../api/client';

export default function AdminHostels() {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getAllHostels();
      setHostels(data.data || []);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load hostels.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggle = async (hostel) => {
    setBusyId(hostel.id);
    setActionError('');
    try {
      await toggleHostelStatus(hostel.id);
      load();
    } catch (err) {
      setActionError(apiErrorMessage(err, 'Could not update this listing.'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardLayout stops={adminStops} roleLabel="Admin">
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">Listings</span>
          <h1 style={{ margin: 0 }}>Hostel approval</h1>
        </div>
      </div>

      <Alert>{actionError}</Alert>

      {loading && <Loader />}
      {!loading && error && <EmptyState title="Couldn't load hostels" hint={error} />}
      {!loading && !error && hostels.length === 0 && (
        <EmptyState title="No hostels yet" />
      )}
      {!loading && !error && hostels.length > 0 && (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Hostel</th>
                <th>City</th>
                <th>Owner</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {hostels.map((h) => (
                <tr key={h.id}>
                  <td>{h.name}</td>
                  <td>{h.city}</td>
                  <td>
                    <div>{h.owner_name || '—'}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{h.owner_email}</div>
                  </td>
                  <td>
                    <span className={`stamp ${h.is_active ? 'stamp-confirmed' : 'stamp-cancelled'}`}>
                      {h.is_active ? 'live' : 'unlisted'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${h.is_active ? 'btn-danger' : 'btn-primary'}`}
                      disabled={busyId === h.id}
                      onClick={() => toggle(h)}
                    >
                      {busyId === h.id ? '…' : h.is_active ? 'Unlist' : 'Approve & list'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
