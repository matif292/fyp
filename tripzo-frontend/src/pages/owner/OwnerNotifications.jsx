import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Loader, EmptyState, Alert } from '../../components/Feedback';
import { ownerStops } from './OwnerDashboard';
import { getOwnerNotifications, markNotificationRead, markAllNotificationsRead } from '../../api/notifications';
import { apiErrorMessage } from '../../api/client';
import { Bell, CalendarPlus, CalendarX, Star, Megaphone, Check } from 'lucide-react';

const TYPE_ICON = {
  booking: <CalendarPlus size={16} />,
  cancellation: <CalendarX size={16} />,
  review: <Star size={16} />,
  system: <Megaphone size={16} />,
};

export default function OwnerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getOwnerNotifications();
      setNotifications(data.data || []);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load notifications.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    setBusyId(id);
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)));
    } catch {
      // no-op — leave as unread if it fails
    } finally {
      setBusyId(null);
    }
  };

  const markAll = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not mark all as read.'));
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <DashboardLayout stops={ownerStops} roleLabel="Owner">
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">Stay in the loop</span>
          <h1 style={{ margin: 0 }}>Notifications {unreadCount > 0 && <span className="stamp stamp-pending">{unreadCount} new</span>}</h1>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-outline btn-sm" disabled={markingAll} onClick={markAll}>
            <Check size={14} /> Mark all read
          </button>
        )}
      </div>

      <Alert>{error}</Alert>

      {loading && <Loader />}
      {!loading && notifications.length === 0 && (
        <EmptyState title="No notifications yet" hint="New bookings, cancellations and reviews for your hostels will show up here." />
      )}
      {!loading && notifications.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              className="card card-pad"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', opacity: n.is_read ? 0.65 : 1 }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, minWidth: 200 }}>
                <span style={{ marginTop: 2 }}>{TYPE_ICON[n.type] || <Bell size={16} />}</span>
                <div>
                  <p style={{ margin: 0 }}>{n.message}</p>
                  <p className="muted" style={{ margin: '4px 0 0', fontSize: 12 }}>
                    {n.hostel_name}{n.booking_number ? ` · ${n.booking_number}` : ''} · {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              {!n.is_read && (
                <button className="btn btn-outline btn-sm" disabled={busyId === n.id} onClick={() => markRead(n.id)}>
                  {busyId === n.id ? '…' : 'Mark read'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
