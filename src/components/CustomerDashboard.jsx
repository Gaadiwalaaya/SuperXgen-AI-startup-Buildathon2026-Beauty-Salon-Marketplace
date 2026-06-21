import React, { useState } from 'react';
import ChatWindow from './ChatWindow';

const STATUS_CONFIG = {
  pending:  { label: 'Awaiting Artist Approval', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)',  icon: '⏳' },
  approved: { label: 'Confirmed & Locked In',    color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.3)',   icon: '✅' },
  declined: { label: 'Booking Declined',          color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   icon: '❌' },
  cancelled:{ label: 'Cancelled',                 color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.3)', icon: '🚫' },
  completed:{ label: 'Service Completed',         color: '#a855f7', bg: 'rgba(168,85,247,0.1)',  border: 'rgba(168,85,247,0.3)',  icon: '🌸' },
};

function StatCard({ icon, label, value, accent }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid ${accent || 'var(--border-light)'}`,
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center',
      flex: 1,
      minWidth: '120px',
    }}>
      <div style={{ fontSize: '28px', marginBottom: '6px' }}>{icon}</div>
      <div style={{ fontSize: '26px', fontWeight: '700', color: accent || 'var(--gold-primary)', marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
    </div>
  );
}

function BookingCard({ booking, onCancel, onOpenChat, isChatOpen }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid var(--border-light)',
      borderRadius: '14px',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      marginBottom: '16px',
    }}>
      {/* Card Header */}
      <div
        style={{
          padding: '18px 22px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          borderBottom: expanded ? '1px solid var(--border-light)' : 'none',
        }}
        onClick={() => setExpanded(e => !e)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--gold-primary), var(--rose-gold))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', flexShrink: 0,
          }}>
            💄
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: '600', color: '#fff', fontSize: '14px', marginBottom: '3px' }}>
              {booking.packageName}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {booking.artistName} • {booking.selectedDate}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            padding: '5px 12px', borderRadius: '20px',
            background: cfg.bg, border: `1px solid ${cfg.border}`,
            color: cfg.color, fontSize: '11px', fontWeight: '600',
            whiteSpace: 'nowrap',
          }}>
            {cfg.icon} {cfg.label}
          </div>
          <div style={{ color: 'var(--gold-primary)', fontWeight: '700', fontSize: '15px', whiteSpace: 'nowrap' }}>
            ₹{booking.totalPrice.toLocaleString('en-IN')}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '18px', lineHeight: 1 }}>
            {expanded ? '▲' : '▼'}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div style={{ padding: '20px 22px', background: 'rgba(0,0,0,0.15)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            {[
              { label: 'Booking ID',       val: booking.id },
              { label: 'Time Slot',        val: booking.selectedTime || '—' },
              { label: 'Wedding Venue',    val: booking.weddingLocation || '—' },
              { label: 'Booked On',        val: booking.timestamp || '—' },
              { label: 'Base Package',     val: `₹${booking.packagePrice?.toLocaleString('en-IN') || '—'}` },
              { label: 'Add-on Total',     val: booking.addons?.length ? `₹${booking.addons.reduce((s, a) => s + a.price, 0).toLocaleString('en-IN')}` : 'None' },
            ].map(({ label, val }) => (
              <div key={label} style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>{label}</div>
                <div style={{ fontSize: '13px', color: '#fff', fontWeight: '500' }}>{val}</div>
              </div>
            ))}
          </div>

          {booking.addons?.length > 0 && (
            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(212,175,55,0.04)', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.15)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Add-ons Selected</div>
              {booking.addons.map((a, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <span>• {a.name}</span>
                  <span className="gold-gradient-text">₹{a.price.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          )}

          {booking.cancelReason && (
            <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', fontSize: '12px', color: '#ef4444', marginBottom: '14px' }}>
              ℹ️ <strong>Reason:</strong> {booking.cancelReason}
            </div>
          )}

          {/* Escrow note for approved/pending */}
          {(booking.status === 'approved' || booking.status === 'pending') && (
            <div style={{ padding: '10px 14px', background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '14px' }}>
              🔒 <strong>Maharani Escrow:</strong> Your payment of ₹{booking.totalPrice.toLocaleString('en-IN')} is securely held in escrow and will be released to the artist only after your wedding service is completed.
            </div>
          )}

          {/* Cancel action for pending bookings */}
          {booking.status === 'pending' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => onOpenChat(booking)}
                style={{
                  background: isChatOpen ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.05)',
                  border: isChatOpen ? '1px solid var(--gold-primary)' : '1px solid var(--border-light)',
                  color: isChatOpen ? 'var(--gold-primary)' : 'var(--text-secondary)',
                  padding: '8px 16px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: '600',
                }}
              >
                💬 {isChatOpen ? 'Close Chat' : 'Chat with Artist'}
              </button>
              <button
                onClick={() => onCancel(booking.id)}
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#ef4444',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  letterSpacing: '0.5px',
                }}
              >
                Cancel Request
              </button>
            </div>
          )}

          {/* Chat button for non-pending (approved, etc.) */}
          {booking.status !== 'pending' && booking.status !== 'cancelled' && booking.status !== 'declined' && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <button
                onClick={() => onOpenChat(booking)}
                style={{
                  background: isChatOpen ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.05)',
                  border: isChatOpen ? '1px solid var(--gold-primary)' : '1px solid var(--border-light)',
                  color: isChatOpen ? 'var(--gold-primary)' : 'var(--text-secondary)',
                  padding: '8px 16px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: '600',
                }}
              >
                💬 {isChatOpen ? 'Close Chat' : 'Chat with Artist'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CustomerDashboard({ customer, bookings, onCancelBooking, onLogout }) {
  const [activeTab, setActiveTab] = useState('all');
  const [activeChat, setActiveChat] = useState(null);

  // Filter bookings that belong to this customer.
  // Primary match: by email (set on all new bookings).
  // Fallback: by name or phone (for older bookings without email).
  const myBookings = bookings.filter(b =>
    (b.clientEmail && b.clientEmail.toLowerCase() === customer.email?.toLowerCase()) ||
    b.clientName?.toLowerCase() === customer.name?.toLowerCase() ||
    b.clientPhone === customer.phone
  );

  const filterMap = {
    all:       myBookings,
    pending:   myBookings.filter(b => b.status === 'pending'),
    approved:  myBookings.filter(b => b.status === 'approved'),
    completed: myBookings.filter(b => b.status === 'completed'),
    cancelled: myBookings.filter(b => b.status === 'cancelled' || b.status === 'declined'),
  };

  const displayed = filterMap[activeTab] || myBookings;

  const totalSpent = myBookings
    .filter(b => b.status === 'approved' || b.status === 'completed')
    .reduce((s, b) => s + b.totalPrice, 0);

  const tabs = [
    { key: 'all',       label: 'All Bookings',  count: myBookings.length },
    { key: 'pending',   label: 'Pending',        count: filterMap.pending.length },
    { key: 'approved',  label: 'Confirmed',      count: filterMap.approved.length },
    { key: 'completed', label: 'Completed',      count: filterMap.completed.length },
    { key: 'cancelled', label: 'Cancelled',      count: filterMap.cancelled.length },
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 30px 80px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '6px' }}>
            Customer Portal
          </p>
          <h2 className="font-serif gold-gradient-text" style={{ fontSize: '32px', margin: 0 }}>
            Welcome, {customer.name.split(' ')[0]} ✨
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '6px' }}>
            {customer.email} • {customer.phone}
          </p>
        </div>
        <button
          onClick={onLogout}
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border-light)',
            color: 'var(--text-secondary)',
            padding: '9px 20px',
            borderRadius: '8px',
            fontSize: '12px',
            cursor: 'pointer',
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}
        >
          Sign Out
        </button>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '36px', flexWrap: 'wrap' }}>
        <StatCard icon="📋" label="Total Bookings"   value={myBookings.length}                      accent="var(--gold-primary)" />
        <StatCard icon="⏳" label="Awaiting Approval" value={filterMap.pending.length}               accent="#f59e0b" />
        <StatCard icon="✅" label="Confirmed"          value={filterMap.approved.length}              accent="#22c55e" />
        <StatCard icon="💰" label="Escrow Secured"    value={`₹${(totalSpent/1000).toFixed(0)}K`}   accent="var(--rose-gold)" />
      </div>

      {/* ── Tab Filter ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: activeTab === t.key ? '1px solid var(--gold-primary)' : '1px solid var(--border-light)',
              background: activeTab === t.key ? 'rgba(212,175,55,0.12)' : 'transparent',
              color: activeTab === t.key ? 'var(--gold-primary)' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: activeTab === t.key ? '600' : '400',
              cursor: 'pointer',
              letterSpacing: '0.5px',
              transition: 'all 0.2s ease',
            }}
          >
            {t.label}
            {t.count > 0 && (
              <span style={{
                marginLeft: '7px',
                background: activeTab === t.key ? 'var(--gold-primary)' : 'rgba(255,255,255,0.1)',
                color: activeTab === t.key ? '#000' : 'var(--text-secondary)',
                borderRadius: '10px',
                padding: '1px 7px',
                fontSize: '10px',
                fontWeight: '700',
              }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Bookings List ── */}
      {displayed.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '16px',
          border: '1px solid var(--border-light)',
        }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>💄</div>
          <h4 className="font-serif" style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>No bookings here yet</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Head to the marketplace and book your dream bridal artist!
          </p>
        </div>
      ) : (
        <div>
          {displayed.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={onCancelBooking}
              onOpenChat={(b) => setActiveChat(activeChat?.id === b.id ? null : b)}
              isChatOpen={activeChat?.id === booking.id}
            />
          ))}
        </div>
      )}

      {/* ── Help Banner ── */}
      <div style={{
        marginTop: '40px',
        padding: '20px 24px',
        background: 'linear-gradient(135deg, rgba(212,175,55,0.07), rgba(183,110,121,0.07))',
        border: '1px solid rgba(212,175,55,0.2)',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '32px' }}>👑</span>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontWeight: '600', color: 'var(--gold-primary)', marginBottom: '4px', fontSize: '14px' }}>Need help with your booking?</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
            Call us at <strong style={{ color: '#fff' }}>+91 98100 12345</strong> or WhatsApp — our concierge team is available 9 AM – 9 PM, 7 days a week.
          </div>
        </div>
      </div>

      {activeChat && (
        <ChatWindow
          booking={activeChat}
          senderName={customer.name}
          senderRole="customer"
          onClose={() => setActiveChat(null)}
        />
      )}
    </div>
  );
}
