import React, { useState } from 'react';
import ChatWindow from './ChatWindow';

export default function ArtistDashboard({ artist, bookings, onUpdateBookingStatus }) {
  const [activeTab, setActiveTab] = useState('all');
  
  // Modal states for cancellation
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  // Active chat booking
  const [activeChat, setActiveChat] = useState(null);

  // Filter bookings associated with THIS artist
  const artistBookings = bookings.filter(b => b.artistId === artist.id);

  // Filter queue based on selected tab
  const filteredBookings = artistBookings.filter(b => {
    if (activeTab === 'all') return true;
    return b.status === activeTab;
  });

  // Calculate stats
  const pendingCount = artistBookings.filter(b => b.status === 'pending').length;
  const approvedCount = artistBookings.filter(b => b.status === 'approved').length;
  
  const cancelledBookings = artistBookings.filter(b => b.status === 'cancelled');
  const cancelledCount = cancelledBookings.length;

  // Escrow Revenue Calculations
  const approvedValue = artistBookings
    .filter(b => b.status === 'approved')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const pendingEscrowValue = artistBookings
    .filter(b => b.status === 'paid_escrow')
    .reduce((sum, b) => sum + b.totalPrice, 0);
  const pendingEscrowCount = artistBookings.filter(b => b.status === 'paid_escrow').length;

  const collectedGrossValue = artistBookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + b.totalPrice, 0);
  const collectedCount = artistBookings.filter(b => b.status === 'completed').length;

  // Platform Commission Penalty (If cancels >= 2, platform takes 15% cut, otherwise 5%)
  const isPenaltyActive = cancelledCount >= 2;
  const commissionRate = isPenaltyActive ? 0.15 : 0.05;
  const commissionValue = collectedGrossValue * commissionRate;
  const netEarnings = collectedGrossValue - commissionValue;

  const openCancelModal = (bookingId) => {
    setCancellingBookingId(bookingId);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setCancellingBookingId(null);
    setCancelReason('');
  };

  const handleConfirmCancellation = () => {
    if (!cancelReason.trim()) {
      alert("Please provide a reason for cancellation.");
      return;
    }
    // Update booking status to cancelled with the reason
    onUpdateBookingStatus(cancellingBookingId, 'cancelled', cancelReason.trim());
    closeCancelModal();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Platform Warning Alert if Penalty is active */}
      {isPenaltyActive && (
        <div style={{
          padding: '15px 20px',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '8px',
          color: '#ef4444',
          textAlign: 'left',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span>⚠️</span>
          <div>
            <strong>Platform Commission Penalty Active:</strong> You have cancelled <strong>{cancelledCount}</strong> bookings. 
            Maharani Bridal administration has applied a 15% commission rate (instead of the standard 5%) to your next package payouts. 
            Please minimize cancellations to restore standard rates.
          </div>
        </div>
      )}

      {/* Escrow & Financial Summary Panels */}
      <div style={{ textAlign: 'left' }}>
        <h4 className="font-serif gold-gradient-text" style={{ fontSize: '22px', marginBottom: '20px' }}>
          Escrow & Financial Ledger
        </h4>
        
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          
          {/* Box 1: Approved Requests */}
          <div className="stat-card" style={{ padding: '25px', position: 'relative', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
              Approved Requests
            </div>
            <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#fff', marginBottom: '5px' }}>
              ₹{approvedValue.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {approvedCount} Bookings slots approved
            </div>
            <div style={{ position: 'absolute', bottom: '8px', right: '12px', fontSize: '9px', color: 'var(--gold-light)' }}>
              Waiting Customer Payment
            </div>
          </div>

          {/* Box 2: Revenue Pending (Escrow) */}
          <div className="stat-card" style={{ padding: '25px', position: 'relative', border: '1px solid rgba(212, 175, 55, 0.25)', background: 'rgba(212, 175, 55, 0.02)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
              Revenue Pending (Escrow)
            </div>
            <div style={{ fontSize: '26px', fontWeight: 'bold', color: 'var(--gold-light)', marginBottom: '5px' }}>
              ₹{pendingEscrowValue.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {pendingEscrowCount} Paid by customers, held in escrow
            </div>
            <div style={{ position: 'absolute', bottom: '8px', right: '12px', fontSize: '9px', color: '#60a5fa' }}>
              Locked Until Service Completed
            </div>
          </div>

          {/* Box 3: Revenue Collected */}
          <div className="stat-card" style={{ padding: '25px', position: 'relative', border: '1px solid var(--border-gold)', background: 'rgba(10, 20, 10, 0.1)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
              Revenue Collected (Total)
            </div>
            <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#22c55e', marginBottom: '5px' }}>
              ₹{netEarnings.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span>Gross: ₹{collectedGrossValue.toLocaleString('en-IN')} ({collectedCount} Done)</span>
              <span>Platform Cut ({commissionRate * 100}%): -₹{commissionValue.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ position: 'absolute', bottom: '8px', right: '12px', fontSize: '9px', color: '#22c55e' }}>
              Disbursed to Wallet
            </div>
          </div>

        </div>
      </div>

      {/* Booking Queue & Tabs */}
      <div className="glass-card ai-card" style={{ textAlign: 'left', padding: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
          <h4 className="font-serif gold-gradient-text" style={{ fontSize: '22px', margin: 0 }}>
            Booking Approvals Queue
          </h4>
          
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Requests' },
              { id: 'pending', label: `Pending (${pendingCount})` },
              { id: 'approved', label: 'Approved' },
              { id: 'paid_escrow', label: 'Paid (Escrow)' },
              { id: 'completed', label: 'Completed' },
              { id: 'cancelled', label: `Cancelled (${cancelledCount})` }
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)}
                className="action-btn"
                style={{
                  background: activeTab === tab.id ? 'var(--gold-primary)' : 'rgba(255,255,255,0.02)',
                  color: activeTab === tab.id ? 'var(--bg-darker)' : 'var(--text-secondary)',
                  border: '1px solid var(--border-light)',
                  padding: '5px 12px',
                  fontSize: '11px',
                  borderRadius: '15px',
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border-light)', borderRadius: '8px' }}>
            No wedding bookings found in the selected queue category.
          </div>
        ) : (
          <div className="booking-requests-list" style={{ display: 'grid', gap: '20px' }}>
            {filteredBookings.map(b => (
              <div key={b.id} className="booking-request-card" style={{ border: '1px solid var(--border-light)', borderRadius: '10px', padding: '20px', background: 'rgba(0,0,0,0.15)' }}>
                <div className="req-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <span className="req-client" style={{ fontSize: '16px', fontWeight: '600', color: '#fff' }}>{b.clientName}</span>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Booking ID: {b.id}</div>
                  </div>
                  
                  {/* Status Badge */}
                  <span className={`req-status-badge ${b.status}`} style={{ 
                    padding: '4px 10px', 
                    borderRadius: '12px', 
                    fontSize: '10px', 
                    textTransform: 'uppercase', 
                    fontWeight: '600',
                    background: b.status === 'pending' ? 'rgba(245, 158, 11, 0.15)' :
                                b.status === 'approved' ? 'rgba(59, 130, 246, 0.15)' :
                                b.status === 'paid_escrow' ? 'rgba(139, 92, 246, 0.15)' :
                                b.status === 'completed' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: b.status === 'pending' ? '#f59e0b' :
                           b.status === 'approved' ? '#3b82f6' :
                           b.status === 'paid_escrow' ? '#8b5cf6' :
                           b.status === 'completed' ? '#22c55e' : '#ef4444',
                    border: b.status === 'pending' ? '1px solid rgba(245, 158, 11, 0.3)' :
                            b.status === 'approved' ? '1px solid rgba(59, 130, 246, 0.3)' :
                            b.status === 'paid_escrow' ? '1px solid rgba(139, 92, 246, 0.3)' :
                            b.status === 'completed' ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
                  }}>
                    {b.status === 'paid_escrow' ? 'paid (escrow)' : b.status}
                  </span>
                </div>
                
                <div className="req-details" style={{ fontSize: '13px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px', color: 'var(--text-secondary)', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ margin: 0 }}>✨ <strong>Couture Look:</strong> {b.packageName}</p>
                  <p style={{ margin: 0 }}>📅 <strong>Schedule:</strong> {b.selectedDate} at {b.selectedTime}</p>
                  <p style={{ margin: 0 }}>📍 <strong>Venue Location:</strong> {b.weddingLocation}</p>
                  <p style={{ margin: 0 }}>📞 <strong>Phone:</strong> {b.clientPhone}</p>
                  {b.addons && b.addons.length > 0 && (
                    <p style={{ margin: 0, gridColumn: 'span 2', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <strong>Included Add-ons:</strong> {b.addons.map(a => `${a.name} (₹${a.price})`).join(', ')}
                    </p>
                  )}
                  {b.cancelReason && (
                    <div style={{ gridColumn: 'span 2', padding: '10px', background: 'rgba(239, 68, 68, 0.05)', borderLeft: '3px solid #ef4444', borderRadius: '4px', marginTop: '5px' }}>
                      <strong>💬 Reason for Cancellation:</strong> "{b.cancelReason}"
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Client Deposit (Total Price)</span>
                    <span className="gold-gradient-text" style={{ fontWeight: '600', fontSize: '18px' }}>
                      ₹{b.totalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {/* ── Chat button (always visible) ── */}
                    <button
                      onClick={() => setActiveChat(activeChat?.id === b.id ? null : b)}
                      style={{
                        background: activeChat?.id === b.id ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)',
                        border: activeChat?.id === b.id ? '1px solid var(--gold-primary)' : '1px solid var(--border-light)',
                        color: activeChat?.id === b.id ? 'var(--gold-primary)' : 'var(--text-secondary)',
                        padding: '6px 14px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer',
                        fontWeight: '600',
                      }}
                    >
                      💬 {activeChat?.id === b.id ? 'Close Chat' : 'Chat Client'}
                    </button>

                    {/* Actions for PENDING */}
                    {b.status === 'pending' && (
                      <>
                        <button 
                          className="action-btn approve" 
                          onClick={() => onUpdateBookingStatus(b.id, 'approved')}
                          style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                        >
                          Approve
                        </button>
                        <button 
                          className="action-btn decline" 
                          onClick={() => onUpdateBookingStatus(b.id, 'declined')}
                          style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {/* Actions for APPROVED */}
                    {b.status === 'approved' && (
                      <>
                        <button 
                          onClick={() => onUpdateBookingStatus(b.id, 'paid_escrow')}
                          style={{ background: 'var(--gold-primary)', color: 'var(--bg-darker)', border: 'none', padding: '6px 14px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}
                        >
                          💸 Simulate Client Payment
                        </button>
                        <button 
                          onClick={() => openCancelModal(b.id)}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '6px 14px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                        >
                          Cancel Booking
                        </button>
                      </>
                    )}

                    {/* Actions for PAID_ESCROW */}
                    {b.status === 'paid_escrow' && (
                      <>
                        <button 
                          onClick={() => onUpdateBookingStatus(b.id, 'completed')}
                          style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}
                        >
                          ✅ Simulate Service Completed (Both Approve)
                        </button>
                        <button 
                          onClick={() => openCancelModal(b.id)}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '6px 14px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                        >
                          Cancel Booking
                        </button>
                      </>
                    )}

                    {/* Badge for Completed */}
                    {b.status === 'completed' && (
                      <span style={{ color: '#22c55e', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>✔️</span> Payout Finalized
                      </span>
                    )}

                    {/* Badge for Cancelled */}
                    {b.status === 'cancelled' && (
                      <span style={{ color: '#ef4444', fontSize: '12px' }}>
                        ❌ Cancelled
                      </span>
                    )}

                    {/* Badge for Declined */}
                    {b.status === 'declined' && (
                      <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                        Declined
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CANCELLATION MODAL POPUP */}
      {showCancelModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="glass-card ai-card" style={{
            maxWidth: '500px',
            width: '90%',
            padding: '35px',
            textAlign: 'left',
            border: '1px solid var(--border-gold)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            <h4 className="font-serif gold-gradient-text" style={{ fontSize: '22px', marginTop: 0, marginBottom: '15px' }}>
              Cancel Reservation Request
            </h4>

            {/* Warning Banner */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              borderLeft: '4px solid #ef4444',
              padding: '12px 15px',
              borderRadius: '4px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              lineHeight: '1.5',
              marginBottom: '20px'
            }}>
              <strong style={{ color: '#ef4444', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                ⚠️ Administrative Policy Warning
              </strong>
              Booking cancellations are reviewed directly by the Maharani Bridal administration. 
              Frequent cancellations or cancels with unfit reasons will trigger a penalty, increasing the platform commission from 5% to <strong>15%</strong>.
              <div style={{ marginTop: '8px', color: 'var(--gold-light)' }}>
                Your current cancellations: <strong>{cancelledCount}</strong>.
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase' }}>
                Reason for Cancellation *
              </label>
              <textarea
                className="select-input"
                placeholder="Explain the reason for cancelling this booking (e.g. Schedule conflicts, studio closed for maintenance...)"
                rows="4"
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                style={{ resize: 'vertical' }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={closeCancelModal}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-secondary)',
                  padding: '8px 18px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Keep Booking
              </button>
              <button 
                onClick={handleConfirmCancellation}
                disabled={!cancelReason.trim()}
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  opacity: cancelReason.trim() ? 1 : 0.5
                }}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {activeChat && (
        <ChatWindow
          booking={activeChat}
          senderName={artist.name}
          senderRole="artist"
          onClose={() => setActiveChat(null)}
        />
      )}

    </div>
  );
}
