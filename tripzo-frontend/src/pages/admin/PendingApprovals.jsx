import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Loader, EmptyState, Alert } from '../../components/Feedback';
import { adminStops } from './AdminDashboard';
import { getPendingApprovals, approveOwner, rejectOwner } from '../../api/admin';
import { apiErrorMessage } from '../../api/client';
import { Check, X } from 'lucide-react';

export default function PendingApprovals() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState('');
  const [actionError, setActionError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getPendingApprovals();
      setPending(data.data || []);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load pending approvals.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (userId) => {
    setBusyId(userId);
    setActionError('');
    try {
      await approveOwner(userId);
      load();
    } catch (err) {
      setActionError(apiErrorMessage(err, 'Could not approve this owner.'));
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (e) => {
    e.preventDefault();
    setBusyId(rejecting.user_id);
    setActionError('');
    try {
      await rejectOwner(rejecting.user_id, reason);
      setRejecting(null);
      setReason('');
      load();
    } catch (err) {
      setActionError(apiErrorMessage(err, 'Could not reject this owner.'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardLayout stops={adminStops} roleLabel="Admin">
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">Owner review</span>
          <h1 style={{ margin: 0 }}>Pending approvals</h1>
        </div>
      </div>

      <Alert>{actionError}</Alert>

      {loading && <Loader />}
      {!loading && error && <EmptyState title="Couldn't load approvals" hint={error} />}
      {!loading && !error && pending.length === 0 && (
        <EmptyState title="All caught up" hint="No owner accounts are waiting for review." />
      )}
      {!loading && !error && pending.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {pending.map((p) => (
            <div key={p.id} className="card card-pad">
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
                <div>
                  <h4 style={{ marginBottom: 2 }}>{p.full_name}</h4>
                  <p className="muted" style={{ margin: 0 }}>{p.email} · {p.phone}</p>
                  <div className="chip-row" style={{ marginTop: 10 }}>
                    <span className="chip">CNIC {p.cnic_number}</span>
                    {p.business_reg_number && <span className="chip">Biz {p.business_reg_number}</span>}
                    <span className="chip">{p.bank_name}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <button className="btn btn-primary btn-sm" disabled={busyId === p.user_id} onClick={() => approve(p.user_id)}>
                    <Check size={13} /> Approve
                  </button>
                  <button className="btn btn-danger btn-sm" disabled={busyId === p.user_id} onClick={() => setRejecting(p)}>
                    <X size={13} /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {rejecting && (
        <div className="modal-overlay" onClick={() => setRejecting(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 14 }}>Reject {rejecting.full_name}</h3>
            <form onSubmit={reject}>
              <div className="field">
                <label>Reason</label>
                <textarea required value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Business license not provided" />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setRejecting(null)}>Cancel</button>
                <button type="submit" className="btn btn-danger" style={{ flex: 1 }}>Reject</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
