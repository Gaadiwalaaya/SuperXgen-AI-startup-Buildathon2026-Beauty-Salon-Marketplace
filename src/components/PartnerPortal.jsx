import React, { useState, useEffect } from 'react';

export default function PartnerPortal() {
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchBookings = () => {
      const items = JSON.parse(localStorage.getItem('maharani_bookings') || '[]');
      setBookings(items);
    };
    fetchBookings();
    
    // Listen to localstorage updates in real-time
    window.addEventListener('storage', fetchBookings);
    return () => window.removeEventListener('storage', fetchBookings);
  }, []);

  const handleUpdateStatus = (id, newStatus) => {
    const updated = bookings.map(b => {
      if (b.id === id) {
        return { ...b, status: newStatus };
      }
      return b;
    });
    setBookings(updated);
    localStorage.setItem('maharani_bookings', JSON.stringify(updated));
  };

  // Filter logic
  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'all') return true;
    return b.status === activeTab;
  });

  // Analytics helper calculations
  const totalRevenue = bookings
    .filter(b => b.status === 'approved')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const approvedCount = bookings.filter(b => b.status === 'approved').length;

  // Distribute styles for visual representation
  const styleCount = bookings.reduce((acc, curr) => {
    const lookType = curr.packageName.includes('Traditional') ? 'Traditional' :
                     curr.packageName.includes('Pastel') ? 'Pastel' :
                     curr.packageName.includes('Minimalist') ? 'Minimalist' :
                     curr.packageName.includes('Bollywood') ? 'Bollywood' : 'Fusion';
    
    acc[lookType] = (acc[lookType] || 0) + 1;
    return acc;
  }, { Traditional: 3, Pastel: 2, Minimalist: 1, Bollywood: 4, Fusion: 1 }); // initial mock entries + dynamic

  const maxVal = Math.max(...Object.values(styleCount), 1);

  return (
    <section>
      <div style={{ marginBottom: '30px', textAlign: 'left' }}>
        <h3 className="ai-studio-title font-serif">Artist Administration Portal</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Monitor royal wedding invitations, accept client scheduling, and analyze style trends.
        </p>
      </div>

      <div className="dashboard-grid">
        {/* Left Side: Analytics & Statistics */}
        <div className="glass-card ai-card" style={{ textAlign: 'left', height: 'fit-content' }}>
          <h4 className="font-serif" style={{ fontSize: '20px', marginBottom: '20px', color: 'var(--gold-primary)' }}>1. Financial Analytics</h4>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-val">₹{totalRevenue.toLocaleString('en-IN')}</div>
              <div className="stat-lbl">Revenue</div>
            </div>
            <div className="stat-card">
              <div className="stat-val">{approvedCount}</div>
              <div className="stat-lbl">Approved</div>
            </div>
            <div className="stat-card">
              <div className="stat-val">{pendingCount}</div>
              <div className="stat-lbl">Pending</div>
            </div>
          </div>

          <h4 className="font-serif" style={{ fontSize: '18px', margin: '25px 0 15px', color: 'var(--gold-primary)' }}>2. Style Trend Matrix</h4>
          <div style={{ display: 'grid', gap: '15px' }}>
            {Object.keys(styleCount).map(style => {
              const count = styleCount[style];
              const pct = (count / maxVal) * 100;
              return (
                <div key={style} className="style-prob-bar">
                  <div className="style-prob-labels">
                    <span style={{ fontWeight: '500' }}>{style} Bookings</span>
                    <span className="gold-gradient-text" style={{ fontWeight: '600' }}>{count} looks</span>
                  </div>
                  <div className="style-prob-track">
                    <div className="style-prob-fill" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Bookings Queue */}
        <div className="glass-card ai-card" style={{ textAlign: 'left' }}>
          <div style={{ display: 'flex', justifycontent: 'space-between', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h4 className="font-serif" style={{ fontSize: '20px', color: 'var(--gold-primary)' }}>3. Reservation Queue</h4>
            
            <div style={{ display: 'flex', gap: '5px' }}>
              {['all', 'pending', 'approved', 'declined'].map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className="action-btn"
                  style={{
                    background: activeTab === tab ? 'var(--gold-primary)' : 'rgba(255,255,255,0.02)',
                    color: activeTab === tab ? 'var(--bg-darker)' : 'var(--text-secondary)',
                    border: '1px solid var(--border-light)'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {filteredBookings.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No reservations found in this queue category.
            </div>
          ) : (
            <div className="booking-requests-list">
              {filteredBookings.map(b => (
                <div key={b.id} className="booking-request-card">
                  <div className="req-header">
                    <span className="req-client">{b.clientName}</span>
                    <span className={`req-status-badge ${b.status}`}>{b.status}</span>
                  </div>
                  
                  <div className="req-details">
                    <p>💇 <strong>Artist:</strong> {b.artistName}</p>
                    <p>✨ <strong>Couture:</strong> {b.packageName}</p>
                    <p>📅 <strong>Schedule:</strong> {b.selectedDate} at {b.selectedTime}</p>
                    <p>📍 <strong>Location:</strong> {b.weddingLocation}</p>
                    <p>📞 <strong>Phone:</strong> {b.clientPhone}</p>
                    {b.addons.length > 0 && (
                      <p style={{ fontSize: '11px', marginTop: '6px', color: 'var(--text-muted)' }}>
                        <strong>Add-ons:</strong> {b.addons.map(a => a.name).join(', ')}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="gold-gradient-text" style={{ fontWeight: '600', fontSize: '15px' }}>
                      ₹{b.totalPrice.toLocaleString('en-IN')}
                    </span>
                    {b.status === 'pending' && (
                      <div className="req-actions">
                        <button className="action-btn approve" onClick={() => handleUpdateStatus(b.id, 'approved')}>
                          Approve Request
                        </button>
                        <button className="action-btn decline" onClick={() => handleUpdateStatus(b.id, 'declined')}>
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
