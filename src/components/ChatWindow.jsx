import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';

const STATUS_COLORS = {
  idle:       '#6b7280',
  connecting: '#f59e0b',
  open:       '#22c55e',
  closed:     '#6b7280',
  error:      '#ef4444',
};
const STATUS_LABELS = {
  idle:       'Not connected',
  connecting: 'Connecting…',
  open:       'Connected',
  closed:     'Reconnecting…',
  error:      'Server offline',
};

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDate(iso) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Group messages by date */
function groupByDate(messages) {
  const groups = [];
  let lastDate = null;
  for (const msg of messages) {
    const dateLabel = formatDate(msg.timestamp);
    if (dateLabel !== lastDate) {
      groups.push({ type: 'date', label: dateLabel });
      lastDate = dateLabel;
    }
    groups.push({ type: 'message', ...msg });
  }
  return groups;
}

export default function ChatWindow({ booking, senderName, senderRole, onClose }) {
  const DRAFT_KEY = `maharani_chat_draft_${booking.id}_${senderName}`;

  // Restore any unsent draft from localStorage
  const [input, setInput] = useState(() => localStorage.getItem(DRAFT_KEY) || '');
  const [isMinimised, setIsMinimised] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const { messages, status, members, typingUsers, sendMessage, sendTyping } = useChat(
    booking.id,
    senderName,
    senderRole,
    true
  );

  // Persist draft on every keystroke
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    if (val.trim()) {
      localStorage.setItem(DRAFT_KEY, val);
    } else {
      localStorage.removeItem(DRAFT_KEY);
    }
    sendTyping();
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (!isMinimised) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isMinimised]);

  const handleSend = (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || status !== 'open') return;
    sendMessage(text);
    setInput('');
    localStorage.removeItem(DRAFT_KEY); // clear draft on send
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const otherRole     = senderRole === 'customer' ? 'artist' : 'customer';
  const otherMember   = members.find(m => m.role === otherRole);
  const isOtherOnline = !!otherMember;
  // Input is usable any time the WS server itself is connected.
  // The other person being offline just means they'll read it later.
  const canSend = status === 'open';

  const items = groupByDate(messages);

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '28px',
      width: isMinimised ? '280px' : '370px',
      zIndex: 1000,
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.2)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.3s ease',
      fontFamily: 'inherit',
    }}>
      {/* ── HEADER ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1208 0%, #0d0d0d 100%)',
        borderBottom: '1px solid rgba(212,175,55,0.25)',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
      }}
        onClick={() => setIsMinimised(m => !m)}
      >
        {/* Avatar */}
        <div style={{
          width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--gold-primary, #d4af37), #b76e79)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', position: 'relative',
        }}>
          {senderRole === 'artist' ? '💄' : '👰'}
          {/* Online dot for other party */}
          <span style={{
            position: 'absolute', bottom: 0, right: 0,
            width: '10px', height: '10px', borderRadius: '50%',
            background: isOtherOnline ? '#22c55e' : '#6b7280',
            border: '2px solid #0d0d0d',
          }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: '700', fontSize: '13px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {booking.artistName}
          </div>
          <div style={{ fontSize: '10px', color: isOtherOnline ? '#22c55e' : '#6b7280', marginTop: '1px' }}>
            {isOtherOnline ? `${otherMember.name} is online` : `${senderRole === 'customer' ? 'Artist' : 'Client'} is offline`}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* Connection status dot */}
          <span title={STATUS_LABELS[status]} style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: STATUS_COLORS[status], display: 'inline-block',
          }} />
          {/* Minimise / expand */}
          <span style={{ color: '#6b7280', fontSize: '16px', lineHeight: 1 }}>
            {isMinimised ? '▲' : '▼'}
          </span>
          {/* Close */}
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '18px', cursor: 'pointer', lineHeight: 1, padding: 0 }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Booking context banner */}
      {!isMinimised && (
        <div style={{
          background: 'rgba(212,175,55,0.06)',
          borderBottom: '1px solid rgba(212,175,55,0.12)',
          padding: '8px 16px',
          fontSize: '10px',
          color: 'var(--text-secondary, #9ca3af)',
          letterSpacing: '0.5px',
        }}>
          📋 {booking.packageName} · {booking.selectedDate} · #{booking.id}
        </div>
      )}

      {/* ── Offline notice banner — only when server is up but other party isn't in the room ── */}
      {!isMinimised && status === 'open' && !isOtherOnline && (
        <div style={{
          background: 'rgba(245,158,11,0.08)',
          borderBottom: '1px solid rgba(245,158,11,0.2)',
          padding: '8px 16px',
          fontSize: '11px',
          color: '#f59e0b',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span>🕐</span>
          <span>
            {senderRole === 'customer' ? 'Artist' : 'Client'} is offline —{' '}
            <strong>your message will be delivered when they open the chat.</strong>
          </span>
        </div>
      )}

      {/* ── MESSAGE AREA ── */}
      {!isMinimised && (
        <>
          <div style={{
            flex: 1,
            height: '380px',
            overflowY: 'auto',
            background: '#0a0a0a',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}>
            {status === 'connecting' && (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#6b7280', fontSize: '12px' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔄</div>
                Connecting to chat…
              </div>
            )}
            {status === 'error' && (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#ef4444', fontSize: '12px' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
                Chat server offline.<br />
                <span style={{ color: '#6b7280' }}>Make sure the server is running:<br /><code style={{ color: '#f59e0b' }}>npm run dev</code></span>
              </div>
            )}
            {status === 'open' && items.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: '#4b5563', fontSize: '12px' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>💬</div>
                {isOtherOnline
                  ? <>{`${otherMember.name} is here — say hello!`}<br /><span style={{ fontSize: '10px' }}>Ask about makeup looks, trial sessions, or product preferences.</span></>
                  : <>{senderRole === 'customer' ? 'The artist is offline right now.' : 'Your client is offline right now.'}<br /><span style={{ fontSize: '10px', color: '#6b7280' }}>Leave a message — they'll see it as soon as they open the chat. ✉️</span></>
                }
              </div>
            )}

            {items.map((item, idx) => {
              if (item.type === 'date') {
                return (
                  <div key={`date-${idx}`} style={{
                    textAlign: 'center', margin: '12px 0 8px',
                    fontSize: '10px', color: '#4b5563',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}>
                    <div style={{ flex: 1, height: '1px', background: '#1f2937' }} />
                    {item.label}
                    <div style={{ flex: 1, height: '1px', background: '#1f2937' }} />
                  </div>
                );
              }

              const isMine = item.senderName === senderName;
              return (
                <div key={item.id} style={{
                  display: 'flex',
                  flexDirection: isMine ? 'row-reverse' : 'row',
                  alignItems: 'flex-end',
                  gap: '8px',
                  marginBottom: '6px',
                }}>
                  {/* Avatar bubble */}
                  {!isMine && (
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #d4af37, #b76e79)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px',
                    }}>
                      {item.senderRole === 'artist' ? '💄' : '👰'}
                    </div>
                  )}

                  <div style={{ maxWidth: '72%' }}>
                    {/* Sender name (only for others) */}
                    {!isMine && (
                      <div style={{ fontSize: '10px', color: '#d4af37', marginBottom: '3px', paddingLeft: '2px' }}>
                        {item.senderName}
                      </div>
                    )}
                    {/* Message bubble */}
                    <div style={{
                      padding: '9px 13px',
                      borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: isMine
                        ? 'linear-gradient(135deg, #d4af37, #b8950a)'
                        : 'rgba(255,255,255,0.06)',
                      color: isMine ? '#000' : '#e5e7eb',
                      fontSize: '13px',
                      lineHeight: '1.45',
                      wordBreak: 'break-word',
                      border: isMine ? 'none' : '1px solid rgba(255,255,255,0.07)',
                    }}>
                      {item.text}
                    </div>
                    {/* Timestamp */}
                    <div style={{
                      fontSize: '9px', color: '#4b5563', marginTop: '3px',
                      textAlign: isMine ? 'right' : 'left', paddingLeft: '2px', paddingRight: '2px',
                    }}>
                      {formatTime(item.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #d4af37, #b76e79)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', flexShrink: 0,
                }}>💄</div>
                <div style={{
                  padding: '8px 13px', borderRadius: '16px 16px 16px 4px',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.07)',
                  display: 'flex', gap: '4px', alignItems: 'center',
                }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: '#9ca3af',
                      animation: `typingDot 1.2s ${i * 0.2}s ease-in-out infinite`,
                      display: 'inline-block',
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: '10px', color: '#6b7280' }}>
                  {typingUsers.join(', ')} typing…
                </span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={handleSend}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              background: '#111',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={
                status === 'open'
                  ? isOtherOnline
                    ? 'Type a message… (Enter to send)'
                    : `Leave a message for the ${senderRole === 'customer' ? 'artist' : 'client'}…`
                  : STATUS_LABELS[status]
              }
              disabled={status !== 'open'}
              rows={1}
              style={{
                flex: 1,
                resize: 'none',
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${status === 'open' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'}`,
                borderRadius: '10px',
                color: '#fff',
                padding: '9px 12px',
                fontSize: '13px',
                outline: 'none',
                lineHeight: '1.4',
                fontFamily: 'inherit',
                maxHeight: '100px',
                overflowY: 'auto',
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || !canSend}
              style={{
                width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                background: input.trim() && canSend
                  ? 'linear-gradient(135deg, #d4af37, #b8950a)'
                  : 'rgba(255,255,255,0.08)',
                border: 'none',
                cursor: input.trim() && canSend ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px',
                transition: 'all 0.2s ease',
              }}
            >
              ➤
            </button>
          </form>

          {/* Typing animation keyframes injected inline */}
          <style>{`
            @keyframes typingDot {
              0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
              30% { transform: translateY(-4px); opacity: 1; }
            }
          `}</style>
        </>
      )}
    </div>
  );
}
