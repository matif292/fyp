import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { sendChatMessage, getChatHistory, clearChat } from '../api/chatbot';
import { Bot, Sparkles, Send, Trash2, X, Loader2, MapPin, Star } from 'lucide-react';

export default function ChatbotWidget() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadedHistory, setLoadedHistory] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open && !loadedHistory && isAuthenticated) {
      getChatHistory()
        .then(({ data }) => {
          setMessages((data.data || []).map((m) => ({ role: m.role, text: m.message })));
          setLoadedHistory(true);
        })
        .catch(() => setLoadedHistory(true));
    }
  }, [open, loadedHistory, isAuthenticated]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  if (!isAuthenticated) return null;

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setSending(true);
    try {
      const { data } = await sendChatMessage(text);
      const { reply, hostels } = data.data;
      setMessages((prev) => [...prev, { role: 'assistant', text: reply, hostels }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', text: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setSending(false);
    }
  };

  const handleClear = async () => {
    try {
      await clearChat();
      setMessages([]);
    } catch {
      // no-op
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat assistant' : 'Open chat assistant'}
        style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 1000,
          width: 56, height: 56, borderRadius: '50%', border: 'none',
          background: 'var(--primary, #1d5fa8)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)', cursor: 'pointer',
        }}
      >
        {open ? <X size={22} /> : <Bot size={24} />}
      </button>

      {open && (
        <div
          style={{
            position: 'fixed', bottom: 88, right: 20, zIndex: 1000,
            width: 'min(360px, calc(100vw - 40px))', height: 'min(520px, calc(100vh - 140px))',
            background: 'var(--paper, #fff)', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid var(--border, #e2e2e2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid var(--border, #e2e2e2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} />
              <strong style={{ fontSize: 14 }}>Tripzo AI</strong>
            </div>
            <button className="btn btn-outline btn-sm" onClick={handleClear} title="Clear conversation">
              <Trash2 size={13} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.length === 0 && (
              <p className="muted" style={{ fontSize: 13, margin: 0 }}>
                Ask me to find a hostel, estimate a trip budget, or check the weather — anywhere in Pakistan.
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                <div
                  style={{
                    padding: '8px 12px', borderRadius: 10, fontSize: 13, lineHeight: 1.4,
                    background: m.role === 'user' ? 'var(--primary, #1d5fa8)' : 'var(--paper-dim, #f2f2f2)',
                    color: m.role === 'user' ? '#fff' : 'inherit',
                  }}
                >
                  {m.text}
                </div>
                {m.hostels?.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
                    {m.hostels.map((h) => (
                      <a
                        key={h.id}
                        href={`/hostels/${h.id}`}
                        className="card card-pad"
                        style={{ display: 'block', textDecoration: 'none', color: 'inherit', padding: 8 }}
                      >
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{h.name}</div>
                        <div style={{ display: 'flex', gap: 10, fontSize: 12, marginTop: 2 }} className="muted">
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={11} /> {h.city}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Star size={11} /> {h.rating}</span>
                          <span>Rs. {h.min_price}/night</span>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {sending && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }} className="muted">
                <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> Thinking…
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={send} style={{ display: 'flex', gap: 8, padding: 10, borderTop: '1px solid var(--border, #e2e2e2)' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about hostels, budget, weather…"
              style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border, #ccc)', fontSize: 13 }}
            />
            <button className="btn btn-primary btn-sm" type="submit" disabled={sending || !input.trim()}>
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
