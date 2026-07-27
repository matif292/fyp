import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { Loader, EmptyState } from '../../components/Feedback';
import { ownerStops } from './OwnerDashboard';
import { getOwnerHostels } from '../../api/hostels';
import { apiErrorMessage } from '../../api/client';
import { BedDouble, CalendarClock, Plus } from 'lucide-react';

export default function OwnerHostels() {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getOwnerHostels()
      .then(({ data }) => setHostels(data.data || []))
      .catch((err) => setError(apiErrorMessage(err, 'Could not load your hostels.')))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout stops={ownerStops} roleLabel="Owner">
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">Properties</span>
          <h1 style={{ margin: 0 }}>My hostels</h1>
        </div>
        <Link to="/owner/hostels/new">
          <button className="btn btn-primary"><Plus size={15} /> Add a stay</button>
        </Link>
      </div>

      {loading && <Loader />}
      {!loading && error && <EmptyState title="Couldn't load hostels" hint={error} />}
      {!loading && !error && hostels.length === 0 && (
        <EmptyState title="No properties yet" hint="Add your first hostel to get started." />
      )}
      {!loading && !error && hostels.length > 0 && (
        <div className="hostel-grid">
          {hostels.map((h) => (
            <div key={h.id} className="hostel-card">
              <div className="hostel-card-media">
                <span className="city-tag">{h.city}</span>
              </div>
              <div className="hostel-card-body">
                <h3>{h.name}</h3>
                <p className="muted" style={{ margin: '0 0 10px 0' }}>{h.total_rooms} rooms · rating {Number(h.rating || 0).toFixed(1)}</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <Link to={`/owner/hostels/${h.id}/rooms`} style={{ flex: 1 }}>
                    <button className="btn btn-outline btn-sm btn-block"><BedDouble size={13} /> Rooms</button>
                  </Link>
                  <Link to={`/owner/hostels/${h.id}/bookings`} style={{ flex: 1 }}>
                    <button className="btn btn-outline btn-sm btn-block"><CalendarClock size={13} /> Bookings</button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
