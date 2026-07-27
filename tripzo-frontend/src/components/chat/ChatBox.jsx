import React, { useState, useEffect, useRef } from 'react';
import { sendMessage, getMessages, markAsRead } from '../../api/chat';
import { useAuth } from '../../context/AuthContext';
import { Send, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ChatBox = ({ conversationId, recipientName, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const response = await getMessages(conversationId);
      setMessages(response.data.data || []);
      await markAsRead(conversationId);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await sendMessage(conversationId, { 
        message: newMessage, 
        message_type: 'text' 
      });
      setNewMessage('');
      await loadMessages();
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="card card-pad" style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="card" style={{ height: 450, display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <strong>{recipientName || 'Chat'}</strong>
          <span className="muted" style={{ fontSize: 12, marginLeft: 8 }}>
            {messages.length} messages
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} className="btn btn-sm btn-outline">
            <X size={16} />
          </button>
        )}
      </div>

      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              alignSelf: msg.sender_id === user?.id ? 'flex-end' : 'flex-start',
              maxWidth: '70%',
              background: msg.sender_id === user?.id ? 'var(--clay)' : 'var(--paper-dim)',
              color: msg.sender_id === user?.id ? 'white' : 'var(--ink)',
              padding: '8px 12px',
              borderRadius: '8px',
              borderBottomRightRadius: msg.sender_id === user?.id ? 4 : 8,
              borderBottomLeftRadius: msg.sender_id === user?.id ? 8 : 4,
            }}
          >
            <div style={{ fontSize: 14 }}>{msg.message}</div>
            <div style={{ 
              fontSize: 10, 
              opacity: 0.7, 
              marginTop: 4,
              textAlign: msg.sender_id === user?.id ? 'right' : 'left'
            }}>
              {new Date(msg.created_at).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} style={{ 
        padding: '8px 12px', 
        borderTop: '1px solid var(--border)',
        display: 'flex',
        gap: 8
      }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            fontSize: 14,
            outline: 'none'
          }}
        />
        <button 
          type="submit" 
          className="btn btn-primary btn-sm"
          disabled={sending || !newMessage.trim()}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;