import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Loader, EmptyState } from '../../components/Feedback';
import { travelerStops } from './travelerStops.jsx';
import { getMe } from '../../api/auth';
import { apiErrorMessage } from '../../api/client';
import { Mail, Phone, Calendar, Globe, ShieldCheck } from 'lucide-react';

export default function Profile() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMe()
      .then(({ data }) => setMe(data.user))
      .catch((err) => setError(apiErrorMessage(err, 'Could not load your profile.')))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout stops={travelerStops} roleLabel="Traveler">
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">Account</span>
          <h1 style={{ margin: 0 }}>Profile</h1>
        </div>
      </div>

      {loading && <Loader />}
      {!loading && error && <EmptyState title="Couldn't load your profile" hint={error} />}
      {!loading && !error && me && (
        <div className="card card-pad" style={{ maxWidth: 480 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div
              style={{
                width: 52, height: 52, borderRadius: '50%', background: 'var(--pine)', color: 'var(--cream)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18,
              }}
            >
              {me.full_name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17 }}>{me.full_name}</div>
              <span className="stamp stamp-confirmed" style={{ textTransform: 'capitalize' }}>{me.role}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Row icon={<Mail size={15} />} label="Email" value={me.email} />
            <Row icon={<Phone size={15} />} label="Phone" value={me.phone || '—'} />
            <Row icon={<Calendar size={15} />} label="Date of birth" value={me.date_of_birth ? String(me.date_of_birth).slice(0, 10) : '—'} />
            <Row icon={<Globe size={15} />} label="Preferred language" value={me.preferred_language || '—'} />
            <Row
              icon={<ShieldCheck size={15} />}
              label="Email verified"
              value={me.email_verified ? 'Yes' : 'No'}
            />
          </div>

          <p className="muted" style={{ marginTop: 18, marginBottom: 0 }}>
            Account editing isn't available yet — the API doesn't expose an update-profile endpoint.
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}

function Row({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5 }}>
      <span style={{ color: 'var(--moss)' }}>{icon}</span>
      <span className="muted" style={{ width: 140 }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
