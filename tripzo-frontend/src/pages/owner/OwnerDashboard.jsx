import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { Loader, EmptyState } from '../../components/Feedback';
import { getOwnerHostels } from '../../api/hostels';
import { apiErrorMessage } from '../../api/client';
import { Compass, Home, Plus, HeartHandshake, Bell, Building2, BedDouble, Star, BarChart3 } from 'lucide-react';

export const ownerStops = [
  { to: '/owner', label: 'Overview', icon: <Compass size={15} />, end: true },
  { to: '/owner/hostels', label: 'My hostels', icon: <Home size={15} /> },
  { to: '/owner/hostels/new', label: 'Add a stay', icon: <Plus size={15} /> },
  { to: '/owner/negotiations', label: 'Offers', icon: <HeartHandshake size={15} /> },
  { to: '/owner/notifications', label: 'Notifications', icon: <Bell size={15} /> },
];

export default function OwnerDashboard() {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getOwnerHostels()
      .then(({ data }) => setHostels(data.data || []))
      .catch((err) => setError(apiErrorMessage(err, 'Could not load your hostels.')))
      .finally(() => setLoading(false));
  }, []);

  const totalRooms = hostels.reduce((sum, h) => sum + (h.total_rooms || 0), 0);
  const activeCount = hostels.filter((h) => h.is_active).length;
  const avgRating =
    hostels.length ? (hostels.reduce((sum, h) => sum + Number(h.rating || 0), 0) / hostels.length).toFixed(1) : '—';

  return (
    <DashboardLayout stops={ownerStops} roleLabel="Owner">
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">Owner overview</span>
          <h1 style={{ margin: 0 }}>Your listings at a glance</h1>
        </div>
        <Link to="/owner/hostels/new">
          <button className="btn btn-primary"><Plus size={15} /> Add a stay</button>
        </Link>
      </div>

      {loading && <Loader />}
      {!loading && error && <EmptyState title="Couldn't load overview" hint={error} />}
      {!loading && !error && (
        <>
          <div className="tzk-stat-grid">
            <div className="tzk-stat">
              <div>
                <div className="tzk-stat-label">Total hostels</div>
                <div className="tzk-stat-value">{hostels.length}</div>
                <span className={`tzk-stat-trend ${activeCount === hostels.length ? 'up' : 'warn'}`}>
                  {activeCount} active
                </span>
              </div>
              <span className="tzk-tile blue"><Building2 size={20} /></span>
            </div>
            <div className="tzk-stat">
              <div>
                <div className="tzk-stat-label">Total rooms</div>
                <div className="tzk-stat-value">{totalRooms}</div>
                <span className="tzk-stat-trend flat">across all stays</span>
              </div>
              <span className="tzk-tile green"><BedDouble size={20} /></span>
            </div>
            <div className="tzk-stat">
              <div>
                <div className="tzk-stat-label">Average rating</div>
                <div className="tzk-stat-value">{avgRating}</div>
                <span className={`tzk-stat-trend ${Number(avgRating) >= 4 ? 'up' : 'flat'}`}>
                  {Number(avgRating) >= 4 ? 'Guests love your stays' : 'from guest reviews'}
                </span>
              </div>
              <span className="tzk-tile amber"><Star size={20} /></span>
            </div>
            <div className="tzk-stat">
              <div>
                <div className="tzk-stat-label">Offers inbox</div>
                <div className="tzk-stat-value">
                  <Link to="/owner/negotiations" style={{ color: 'var(--primary)', fontSize: 15, fontWeight: 800 }}>
                    Review offers →
                  </Link>
                </div>
                <span className="tzk-stat-trend warn">Needs review</span>
              </div>
              <span className="tzk-tile red"><HeartHandshake size={20} /></span>
            </div>
          </div>

          {hostels.length > 0 && (
            <div className="card card-pad" style={{ marginBottom: 24 }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, fontSize: 14.5 }}>
                <BarChart3 size={16} /> Rooms by property
              </h4>
              <div className="tzk-bars">
                {hostels.slice(0, 8).map((h, i) => {
                  const max = Math.max(...hostels.map((x) => x.total_rooms || 0), 1);
                  const trackPx = 108; // usable bar height inside the 140px chart area, leaving room for the label
                  const barPx = Math.max(((h.total_rooms || 0) / max) * trackPx, 8);
                  return (
                    <div className="tzk-bar-col" key={h.id} title={`${h.name} — ${h.total_rooms || 0} rooms`}>
                      <div
                        className="tzk-bar"
                        style={{
                          height: `${barPx}px`,
                          animationDelay: `${i * 0.06}s`,
                        }}
                      />
                      <span className="tzk-bar-label">{h.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {hostels.length === 0 ? (
            <EmptyState
              title="No properties yet"
              hint="Add your first hostel or guesthouse to start taking bookings."
              action={
                <Link to="/owner/hostels/new">
                  <button className="btn btn-primary" style={{ marginTop: 10 }}>Add a stay</button>
                </Link>
              }
            />
          ) : (
            <div className="card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>City</th>
                    <th>Rooms</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {hostels.map((h) => (
                    <tr key={h.id}>
                      <td>{h.name}</td>
                      <td>{h.city}</td>
                      <td className="mono">{h.total_rooms}</td>
                      <td className="mono">{Number(h.rating || 0).toFixed(1)}</td>
                      <td>
                        <span className={`stamp ${h.is_active ? 'stamp-confirmed' : 'stamp-cancelled'}`}>
                          {h.is_active ? 'active' : 'inactive'}
                        </span>
                      </td>
                      <td>
                        <Link to={`/owner/hostels/${h.id}/bookings`}>
                          <button className="btn btn-outline btn-sm">Bookings</button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
