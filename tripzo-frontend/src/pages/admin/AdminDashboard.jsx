import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Loader, EmptyState } from '../../components/Feedback';
import StatusStamp from '../../components/StatusStamp';
import { getAdminStats, getSentimentOverview } from '../../api/admin';
import { apiErrorMessage } from '../../api/client';
import { LayoutDashboard, ClipboardCheck, Users, Building2, Settings, UserCheck, CalendarCheck2, Wallet, FileClock } from 'lucide-react';

export const adminStops = [
  { to: '/admin', label: 'Overview', icon: <LayoutDashboard size={15} />, end: true },
  { to: '/admin/approvals', label: 'Pending approvals', icon: <ClipboardCheck size={15} /> },
  { to: '/admin/hostels', label: 'Hostel approval', icon: <Building2 size={15} /> },
  { to: '/admin/users', label: 'All users', icon: <Users size={15} /> },
  { to: '/admin/settings', label: 'Settings', icon: <Settings size={15} /> },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminStats()
      .then(({ data }) => setStats(data.data))
      .catch((err) => setError(apiErrorMessage(err, 'Could not load admin stats.')))
      .finally(() => setLoading(false));
    getSentimentOverview()
      .then(({ data }) => setSentiment(data.data))
      .catch(() => setSentiment(null));
  }, []);

  return (
    <DashboardLayout stops={adminStops} roleLabel="Admin">
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">Platform overview</span>
          <h1 style={{ margin: 0 }}>Admin dashboard</h1>
        </div>
      </div>

      {loading && <Loader />}
      {!loading && error && <EmptyState title="Couldn't load stats" hint={error} />}
      {!loading && !error && stats && (
        <>
          <div className="tzk-stat-grid">
            <StatCard
              value={stats.stats.totalUsers}
              label="Total users"
              trend={`${stats.stats.totalTravelers} travelers`}
              tone="up"
              tile="blue"
              icon={<Users size={20} />}
            />
            <StatCard
              value={stats.stats.totalOwners}
              label="Total hostel owners"
              trend={`${stats.stats.totalHostels} hostels listed`}
              tone="up"
              tile="violet"
              icon={<UserCheck size={20} />}
            />
            <StatCard
              value={stats.stats.totalBookings}
              label="Total bookings"
              trend={`Rs. ${stats.stats.totalRevenue} revenue`}
              tone="up"
              tile="green"
              icon={<CalendarCheck2 size={20} />}
            />
            <StatCard
              value={stats.stats.pendingApprovals}
              label="Pending approvals"
              trend={Number(stats.stats.pendingApprovals) > 0 ? 'Needs review' : 'All clear'}
              tone={Number(stats.stats.pendingApprovals) > 0 ? 'warn' : 'up'}
              tile="amber"
              icon={<FileClock size={20} />}
            />
          </div>

          <div className="dash-two-col" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', gap: 24, alignItems: 'start' }}>
            <div>
              <h2 className="section-title">Recent bookings</h2>
              <div className="card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Booking</th>
                      <th>Traveler</th>
                      <th>Hostel</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats.recentBookings || []).map((b) => (
                      <tr key={b.id}>
                        <td className="mono">{b.booking_number}</td>
                        <td>{b.traveler_name}</td>
                        <td>{b.hostel_name}</td>
                        <td className="mono">Rs. {b.total_price}</td>
                        <td><StatusStamp status={b.status} /></td>
                      </tr>
                    ))}
                    {(!stats.recentBookings || stats.recentBookings.length === 0) && (
                      <tr><td colSpan={5} className="muted">No bookings yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="section-title">Recent owner signups</h2>
              <div className="card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Owner</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats.recentOwners || []).map((o) => (
                      <tr key={o.id}>
                        <td>
                          {o.full_name}
                          <div className="muted">{o.email}</div>
                        </td>
                        <td>
                          <span className={`stamp ${o.is_approved ? 'stamp-confirmed' : 'stamp-pending'}`}>
                            {o.is_approved ? 'approved' : 'pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {(!stats.recentOwners || stats.recentOwners.length === 0) && (
                      <tr><td colSpan={2} className="muted">No recent signups.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {sentiment && sentiment.total > 0 && (
            <>
              <h2 className="section-title" style={{ marginTop: 32 }}>Sentiment overview</h2>
              <div className="dash-two-col" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.3fr)', gap: 24, alignItems: 'start' }}>
                <div className="card card-pad">
                  <SentimentBar label="Positive reviews" color="var(--success)" pct={pct(sentiment.positive, sentiment.total)} />
                  <SentimentBar label="Neutral reviews" color="var(--warning)" pct={pct(sentiment.neutral, sentiment.total)} />
                  <SentimentBar label="Negative reviews" color="var(--danger)" pct={pct(sentiment.negative, sentiment.total)} />
                  <div className="snt-donut-wrap">
                    <div
                      className="snt-donut"
                      style={{
                        background: `conic-gradient(var(--success) 0 ${pct(sentiment.positive, sentiment.total)}%, var(--warning) ${pct(sentiment.positive, sentiment.total)}% ${pct(sentiment.positive, sentiment.total) + pct(sentiment.neutral, sentiment.total)}%, var(--danger) ${pct(sentiment.positive, sentiment.total) + pct(sentiment.neutral, sentiment.total)}% 100%)`,
                      }}
                    >
                      <div className="snt-donut-hole">
                        <div>
                          <strong>{sentiment.positive_pct}%</strong>
                          <br />
                          <span>Positive</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="muted" style={{ textAlign: 'center', fontSize: 12.5, margin: 0 }}>
                    Sentiment distribution · {sentiment.total} reviews scored
                  </p>
                </div>

                <div className="card">
                  <div style={{ padding: '14px 18px 0' }}>
                    <strong style={{ fontSize: 14 }}>Lowest-rated listings</strong>
                  </div>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Hostel</th>
                        <th>Reviews</th>
                        <th>Avg sentiment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(sentiment.lowest_rated_hostels || []).map((h) => (
                        <tr key={h.hostel_id}>
                          <td>{h.hostel_name}</td>
                          <td className="mono">{h.total}</td>
                          <td className="mono">{h.avg_score != null ? `${h.avg_score}/100` : '—'}</td>
                        </tr>
                      ))}
                      {(!sentiment.lowest_rated_hostels || sentiment.lowest_rated_hostels.length === 0) && (
                        <tr><td colSpan={3} className="muted">Not enough data yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </DashboardLayout>
  );
}

function StatCard({ value, label, trend, tone = 'flat', tile = 'blue', icon }) {
  return (
    <div className="tzk-stat">
      <div>
        <div className="tzk-stat-label">{label}</div>
        <div className="tzk-stat-value">{value}</div>
        {trend && <span className={`tzk-stat-trend ${tone}`}>{trend}</span>}
      </div>
      <span className={`tzk-tile ${tile}`}>{icon}</span>
    </div>
  );
}

function pct(part, total) {
  return total > 0 ? Math.round((Number(part) / Number(total)) * 100) : 0;
}

function SentimentBar({ label, color, pct: value }) {
  return (
    <div className="snt-row">
      <div className="snt-head">
        <span className="lab">
          <span className="snt-dot" style={{ background: color }} /> {label}
        </span>
        <strong>{value}%</strong>
      </div>
      <div className="snt-track">
        <div className="snt-fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}
