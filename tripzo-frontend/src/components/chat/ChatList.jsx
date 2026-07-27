import React, { useState, useEffect } from 'react';
import { getConversations, startConversation } from '../../api/chat';
import { useAuth } from '../../context/AuthContext';
import { MessageCircle, Users, Search, Plus, X } from 'lucide-react';
import ChatBox from './ChatBox';
import toast from 'react-hot-toast';

const ChatList = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [userId, setUserId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const response = await getConversations();
      setConversations(response.data.data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (e) => {
    e.preventDefault();
    try {
      const response = await startConversation(userId);
      toast.success('Chat started!');
      setShowNewChat(false);
      setUserId('');
      loadConversations();
    } catch (error) {
      toast.error('Failed to start chat');
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.participant_names?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="center-loader">
        <div className="spinner"></div>
      </div>
    );
  }

  if (activeChat) {
    return (
      <ChatBox 
        conversationId={activeChat.id}
        recipientName={activeChat.participant_names}
        onClose={() => setActiveChat(null)}
      />
    );
  }

  return (
    <div className="card" style={{ height: 500, display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MessageCircle size={20} />
          <strong>Messages</strong>
          <span className="muted" style={{ fontSize: 12 }}>({conversations.length})</span>
        </div>
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => setShowNewChat(true)}
        >
          <Plus size={14} /> New
        </button>
      </div>

      <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--paper-dim)', padding: '4px 12px', borderRadius: '6px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              padding: '6px 0',
              fontSize: 14,
              outline: 'none'
            }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {filteredConversations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <MessageCircle size={32} />
            <p style={{ marginTop: 8 }}>No conversations yet</p>
            <p style={{ fontSize: 13 }}>Start a new chat with another user</p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <div
              key={conv.id}
              style={{ 
                cursor: 'pointer', 
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                borderBottom: '1px solid var(--border-light)',
                transition: 'background 0.2s'
              }}
              onClick={() => setActiveChat(conv)}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--paper-dim)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                background: 'var(--clay)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                flexShrink: 0
              }}>
                {conv.participant_names?.charAt(0) || 'U'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: 14 }}>{conv.participant_names || 'Unknown'}</strong>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {new Date(conv.updated_at).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {conv.last_message || 'No messages yet'}
                  </span>
                  {conv.unread_count > 0 && (
                    <span className="stamp stamp-primary" style={{ fontSize: 10, padding: '1px 8px' }}>
                      {conv.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showNewChat && (
        <div className="modal-overlay" onClick={() => setShowNewChat(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Start New Chat</h3>
              <button className="btn btn-sm btn-outline" onClick={() => setShowNewChat(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleStartChat}>
              <div className="field">
                <label>User ID</label>
                <input 
                  type="number" 
                  required 
                  value={userId} 
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter user ID to chat with"
                />
                <div className="field-hint">Enter the user ID of the person you want to chat with</div>
              </div>
              <button className="btn btn-primary btn-block" type="submit">Start Chat</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList;