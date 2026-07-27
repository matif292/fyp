import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  createTripPlan, getTripPlans, agreeToTrip, getTripGroups, addTripMemory, getTripMemories,
  getMyTripStatuses, getJoinRequests, approveJoinRequest, rejectJoinRequest, leaveTripGroup,
} from '../api/trips';
import PublicNavbar from '../components/PublicNavbar';
import ChatBox from '../components/chat/ChatBox';
import { Calendar, Users, MapPin, Clock, Check, Plus, MessageCircle, Image, UserCheck, X, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TripPlanner() {
  const { user, isAuthenticated } = useAuth();
  const [plans, setPlans] = useState([]);
  const [groups, setGroups] = useState([]);
  const [memories, setMemories] = useState({});
  const [myStatuses, setMyStatuses] = useState({});
  const [joinRequests, setJoinRequests] = useState({});
  const [openRequestsFor, setOpenRequestsFor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMemoryModal, setShowMemoryModal] = useState(null);
  const [activeChatGroup, setActiveChatGroup] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    destination: '',
    start_date: '',
    end_date: '',
    budget_estimate: '',
    max_participants: 10
  });
  const [memoryForm, setMemoryForm] = useState({
    media_type: 'photo',
    media_url: '',
    caption: '',
    location: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansRes, groupsRes, statusesRes] = await Promise.all([
        getTripPlans(),
        isAuthenticated ? getTripGroups().catch(() => ({ data: { data: [] } })) : Promise.resolve({ data: { data: [] } }),
        isAuthenticated ? getMyTripStatuses().catch(() => ({ data: { data: [] } })) : Promise.resolve({ data: { data: [] } }),
      ]);
      setPlans(plansRes.data.data || []);
      setGroups(groupsRes.data.data || []);
      const statusMap = {};
      (statusesRes.data.data || []).forEach((s) => { statusMap[s.trip_plan_id] = s.status; });
      setMyStatuses(statusMap);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load trip plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createTripPlan(form);
      toast.success('Trip plan created!');
      setShowCreateModal(false);
      setForm({
        title: '',
        description: '',
        destination: '',
        start_date: '',
        end_date: '',
        budget_estimate: '',
        max_participants: 10
      });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create trip plan');
    }
  };

  const handleAgree = async (planId) => {
    try {
      const response = await agreeToTrip(planId);
      toast.success(response.data.message || 'Join request sent!');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request to join');
    }
  };

  const toggleRequestsPanel = async (planId) => {
    if (openRequestsFor === planId) {
      setOpenRequestsFor(null);
      return;
    }
    setOpenRequestsFor(planId);
    if (!joinRequests[planId]) {
      try {
        const { data } = await getJoinRequests(planId);
        setJoinRequests((prev) => ({ ...prev, [planId]: data.data || [] }));
      } catch (error) {
        toast.error('Could not load join requests');
      }
    }
  };

  const handleApprove = async (planId, requestUserId) => {
    try {
      await approveJoinRequest(planId, requestUserId);
      toast.success('Request approved!');
      setJoinRequests((prev) => ({ ...prev, [planId]: prev[planId].filter((r) => r.user_id !== requestUserId) }));
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not approve request');
    }
  };

  const handleReject = async (planId, requestUserId) => {
    try {
      await rejectJoinRequest(planId, requestUserId);
      toast.success('Request rejected');
      setJoinRequests((prev) => ({ ...prev, [planId]: prev[planId].filter((r) => r.user_id !== requestUserId) }));
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not reject request');
    }
  };

  const handleLeaveGroup = async (groupId) => {
    if (!window.confirm('Leave this trip group? You\'ll lose access to its chat and memories.')) return;
    try {
      await leaveTripGroup(groupId);
      toast.success('You left the trip group');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not leave the group');
    }
  };

  const loadMemories = async (groupId) => {
    try {
      const response = await getTripMemories(groupId);
      setMemories((prev) => ({ ...prev, [groupId]: response.data.data || [] }));
    } catch (error) {
      console.error('Error loading memories:', error);
    }
  };

  const handleAddMemory = async (groupId) => {
    try {
      await addTripMemory(groupId, memoryForm);
      toast.success('Memory added!');
      setShowMemoryModal(null);
      setMemoryForm({ media_type: 'photo', media_url: '', caption: '', location: '' });
      loadMemories(groupId);
      loadData();
    } catch (error) {
      toast.error('Failed to add memory');
    }
  };

  if (loading) {
    return (
      <div className="app-shell">
        <PublicNavbar />
        <div className="center-loader"><div className="spinner"></div></div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <PublicNavbar />
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ marginBottom: 4 }}>Trip Planner</h1>
            <p className="muted">Plan trips with fellow travelers</p>
          </div>
          {isAuthenticated && (
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={16} /> Create Trip Plan
            </button>
          )}
        </div>

        {/* Open trip plans */}
        <h2 className="section-title">Open trip plans</h2>
        {plans.length === 0 ? (
          <div className="card card-pad" style={{ textAlign: 'center', padding: '40px' }}>
            <p className="muted">No open trip plans. Create one!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {plans.map((plan) => (
              <div key={plan.id} className="card card-pad">
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <h3 style={{ marginBottom: 4 }}>{plan.title}</h3>
                      <span className="stamp stamp-pending">{plan.status}</span>
                      <span className="stamp stamp-info">{plan.agreed_count || 0}/{plan.max_participants} agreed</span>
                    </div>
                    <p className="muted">{plan.description}</p>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                        <MapPin size={14} /> {plan.destination}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                        <Calendar size={14} /> {plan.start_date} → {plan.end_date}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                        <Users size={14} /> {plan.current_participants}/{plan.max_participants}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                        <Clock size={14} /> Deadline: {new Date(plan.deadline).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        Created by {plan.creator_name}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    {isAuthenticated && plan.user_id === user?.id && (
                      <button className="btn btn-outline btn-sm" onClick={() => toggleRequestsPanel(plan.id)}>
                        <UserCheck size={14} /> Join requests
                      </button>
                    )}
                    {isAuthenticated && plan.user_id !== user?.id && myStatuses[plan.id] === 'agreed' && (
                      <span className="stamp stamp-confirmed">Member</span>
                    )}
                    {isAuthenticated && plan.user_id !== user?.id && myStatuses[plan.id] === 'pending' && (
                      <span className="stamp stamp-pending">Requested</span>
                    )}
                    {isAuthenticated && plan.user_id !== user?.id && (!myStatuses[plan.id] || myStatuses[plan.id] === 'declined') && (
                      <button className="btn btn-primary btn-sm" onClick={() => handleAgree(plan.id)}>
                        <Check size={14} /> Request to join
                      </button>
                    )}
                  </div>
                </div>

                {openRequestsFor === plan.id && (
                  <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    {!joinRequests[plan.id] ? (
                      <p className="muted" style={{ margin: 0 }}>Loading…</p>
                    ) : joinRequests[plan.id].length === 0 ? (
                      <p className="muted" style={{ margin: 0 }}>No pending join requests.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {joinRequests[plan.id].map((r) => (
                          <div key={r.user_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span>
                              {r.full_name} <span className="muted" style={{ fontSize: 12 }}>({r.email})</span>
                            </span>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-primary btn-sm" onClick={() => handleApprove(plan.id, r.user_id)}>
                                <Check size={12} /> Approve
                              </button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleReject(plan.id, r.user_id)}>
                                <X size={12} /> Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Trip groups (created once someone agrees) */}
        {isAuthenticated && (
          <>
            <h2 className="section-title" style={{ marginTop: 32 }}>My trip groups</h2>
            {groups.length === 0 ? (
              <div className="card card-pad" style={{ textAlign: 'center', padding: '40px' }}>
                <p className="muted">No trip groups yet. Agree to a trip plan above to start one.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {groups.map((group) => (
                  <div key={group.id} className="card card-pad">
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <h4 style={{ marginBottom: 4 }}>{group.name}</h4>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          <span className="muted">{group.destination}</span>
                          <span className="muted">{group.plan_title}</span>
                          <span className="muted">{group.participant_count || 0} participants</span>
                          <span className="muted">{group.memory_count || 0} memories</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => {
                            setShowMemoryModal(group.id);
                            loadMemories(group.id);
                          }}
                        >
                          <Image size={14} /> Memories
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={!group.conversation_id}
                          onClick={() => setActiveChatGroup(group)}
                        >
                          <MessageCircle size={14} /> Chat
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleLeaveGroup(group.id)}>
                          <LogOut size={14} /> Leave
                        </button>
                      </div>
                    </div>

                    {memories[group.id]?.length > 0 && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto' }}>
                        {memories[group.id].slice(0, 4).map((memory) => (
                          <div
                            key={memory.id}
                            style={{
                              minWidth: 100,
                              height: 80,
                              background: 'var(--paper-dim)',
                              borderRadius: 4,
                              overflow: 'hidden',
                              position: 'relative',
                              flexShrink: 0,
                            }}
                          >
                            <img
                              src={memory.media_url}
                              alt={memory.caption}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                            {memory.caption && (
                              <div style={{
                                position: 'absolute', bottom: 0, left: 0, right: 0,
                                background: 'rgba(0,0,0,0.55)', color: '#fff',
                                padding: '2px 6px', fontSize: 10,
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                              }}>
                                {memory.caption}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Create trip plan modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <h3 style={{ marginBottom: 16 }}>Create Trip Plan</h3>
              <form onSubmit={handleCreate}>
                <div className="field">
                  <label>Title</label>
                  <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="field">
                  <label>Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="field">
                  <label>Destination</label>
                  <input required value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} />
                </div>
                <div className="form-grid">
                  <div className="field">
                    <label>Start Date</label>
                    <input type="date" required value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>End Date</label>
                    <input type="date" required value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                  </div>
                </div>
                <div className="field">
                  <label>Budget Estimate (Rs.)</label>
                  <input type="number" value={form.budget_estimate} onChange={(e) => setForm({ ...form, budget_estimate: e.target.value })} />
                </div>
                <div className="field">
                  <label>Max Participants</label>
                  <input type="number" min={1} max={20} value={form.max_participants} onChange={(e) => setForm({ ...form, max_participants: e.target.value })} />
                </div>
                <button className="btn btn-primary btn-block" type="submit">Create Plan</button>
              </form>
            </div>
          </div>
        )}

        {/* Add memory modal */}
        {showMemoryModal && (
          <div className="modal-overlay" onClick={() => setShowMemoryModal(null)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <h3 style={{ marginBottom: 16 }}>Add Memory</h3>
              <form onSubmit={(e) => { e.preventDefault(); handleAddMemory(showMemoryModal); }}>
                <div className="field">
                  <label>Media URL</label>
                  <input
                    required
                    value={memoryForm.media_url}
                    onChange={(e) => setMemoryForm({ ...memoryForm, media_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="field">
                  <label>Caption</label>
                  <input
                    value={memoryForm.caption}
                    onChange={(e) => setMemoryForm({ ...memoryForm, caption: e.target.value })}
                    placeholder="What happened?"
                  />
                </div>
                <div className="field">
                  <label>Location</label>
                  <input
                    value={memoryForm.location}
                    onChange={(e) => setMemoryForm({ ...memoryForm, location: e.target.value })}
                    placeholder="Where was this?"
                  />
                </div>
                <button className="btn btn-primary btn-block" type="submit">Add Memory</button>
              </form>
            </div>
          </div>
        )}

        {/* Trip group chat */}
        {activeChatGroup && (
          <div className="modal-overlay" onClick={() => setActiveChatGroup(null)}>
            <div className="modal-box" style={{ maxWidth: 420, padding: 0 }} onClick={(e) => e.stopPropagation()}>
              <ChatBox
                conversationId={activeChatGroup.conversation_id}
                recipientName={activeChatGroup.name}
                onClose={() => setActiveChatGroup(null)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
