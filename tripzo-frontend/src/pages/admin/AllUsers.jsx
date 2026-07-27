import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Loader, EmptyState, Alert } from '../../components/Feedback';
import { adminStops } from './AdminDashboard';
import { getAllUsers, toggleUserStatus } from '../../api/admin';
import { apiErrorMessage } from '../../api/client';

export default function AllUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getAllUsers();
      setUsers(data.data || []);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load users.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async (user) => {
    setBusyId(user.id);
    setActionError('');
    try {
      await toggleUserStatus(user.id, !user.is_active);
      load();
    } catch (err) {
      setActionError(apiErrorMessage(err, 'Could not update this user.'));
    } finally {
      setBusyId(null);
    }
  };

  const filtered = roleFilter === 'all' ? users : users.filter((u) => u.role === roleFilter);

  return (
    <DashboardLayout stops={adminStops} roleLabel="Admin">
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">Directory</span>
          <h1 style={{ margin: 0 }}>All users</h1>
        </div>
      </div>

      <div className="filter-bar">
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">All roles</option>
          <option value="traveler">Travelers</option>
          <option value="owner">Owners</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <Alert>{actionError}</Alert>

      {loading && <Loader />}
      {!loading && error && <EmptyState title="Couldn't load users" hint={error} />}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState title="No users match this filter" />
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Verified</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>{u.full_name}</td>
                  <td>{u.email}</td>
                  <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                  <td>{u.is_verified ? 'Yes' : 'No'}</td>
                  <td>
                    <span className={`stamp ${u.is_active ? 'stamp-confirmed' : 'stamp-cancelled'}`}>
                      {u.is_active ? 'active' : 'inactive'}
                    </span>
                  </td>
                  <td>
                    {u.role !== 'admin' && (
                      <button
                        className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-primary'}`}
                        disabled={busyId === u.id}
                        onClick={() => toggle(u)}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
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
