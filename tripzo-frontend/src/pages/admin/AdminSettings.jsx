import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Loader, EmptyState, Alert } from '../../components/Feedback';
import { adminStops } from './AdminDashboard';
import { getSettings, updateSettings } from '../../api/admin';
import { apiErrorMessage } from '../../api/client';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getSettings();
      setSettings(data.data);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load platform settings.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await updateSettings({
        maintenance_mode: !!settings.maintenance_mode,
        auto_approve_owners: !!settings.auto_approve_owners,
        announcement_banner: settings.announcement_banner || null,
      });
      setSettings(data.data);
      toast.success('Settings saved');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not save settings.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout stops={adminStops} roleLabel="Admin">
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">Platform controls</span>
          <h1 style={{ margin: 0 }}>Settings</h1>
        </div>
      </div>

      <Alert>{error}</Alert>

      {loading && <Loader />}
      {!loading && error && <EmptyState title="Couldn't load settings" hint={error} />}

      {!loading && settings && (
        <form onSubmit={save} className="card card-pad" style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={!!settings.maintenance_mode}
              onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
              style={{ marginTop: 3 }}
            />
            <span>
              <strong>Maintenance mode</strong>
              <p className="muted" style={{ margin: '2px 0 0', fontSize: 13 }}>
                Pauses all new bookings platform-wide. Travelers will see a friendly error if they try to book while this is on.
              </p>
            </span>
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={!!settings.auto_approve_owners}
              onChange={(e) => setSettings({ ...settings, auto_approve_owners: e.target.checked })}
              style={{ marginTop: 3 }}
            />
            <span>
              <strong>Auto-approve new hostel owners</strong>
              <p className="muted" style={{ margin: '2px 0 0', fontSize: 13 }}>
                Skips the manual review queue — new owner registrations are approved instantly instead of waiting for admin action.
              </p>
            </span>
          </label>

          <div className="field" style={{ margin: 0 }}>
            <label>Site-wide announcement banner</label>
            <textarea
              rows={2}
              placeholder="e.g. Eid special: 10% off all Hunza stays! Leave blank to hide."
              value={settings.announcement_banner || ''}
              onChange={(e) => setSettings({ ...settings, announcement_banner: e.target.value })}
            />
            <p className="muted" style={{ margin: '4px 0 0', fontSize: 12 }}>
              Shown as a banner at the top of every public page. Leave empty to hide it.
            </p>
          </div>

          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        </form>
      )}
    </DashboardLayout>
  );
}
