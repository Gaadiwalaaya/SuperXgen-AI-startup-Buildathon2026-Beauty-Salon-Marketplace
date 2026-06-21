import React from 'react';

export default function Navbar({ 
  activePage, 
  setActivePage, 
  loggedInArtist, 
  loggedInCustomer,
  activeSubPage, 
  setActiveSubPage, 
  onLogout,
  onOpenCustomerLogin
}) {
  return (
    <header className="navbar" style={{ display: 'flex', flexDirection: 'column', padding: '15px 30px', borderBottom: '1px solid var(--border-gold)', background: 'rgba(10, 10, 10, 0.95)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div className="nav-brand" style={{ cursor: 'pointer' }} onClick={() => setActivePage('home')}>
          <h1 className="gold-gradient-text font-serif" style={{ fontSize: '24px', margin: 0, letterSpacing: '2px' }}>MAHARANI BRIDAL</h1>
          <p style={{ fontSize: '9px', letterSpacing: '3px', color: 'var(--text-secondary)', textTransform: 'uppercase', textAlign: 'left', marginTop: '-2px', marginBottom: 0 }}>
            Delhi's Luxury Wedding Registry
          </p>
        </div>
        
        <nav className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            className={`nav-link ${activePage === 'home' ? 'active' : ''}`}
            onClick={() => setActivePage('home')}
            style={{ background: 'none', border: 'none', color: activePage === 'home' ? 'var(--gold-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', fontWeight: '500', letterSpacing: '1px', textTransform: 'uppercase' }}
          >
            Home
          </button>
          <button 
            className={`nav-link ${activePage === 'artistportal' ? 'active' : ''}`}
            onClick={() => setActivePage('artistportal')}
            style={{ background: 'none', border: 'none', color: activePage === 'artistportal' ? 'var(--gold-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', fontWeight: '500', letterSpacing: '1px', textTransform: 'uppercase' }}
          >
            Artist Portal
          </button>

          {/* Customer session pill OR Sign In button */}
          {loggedInCustomer ? (
            <button
              className={`nav-link ${activePage === 'customerdashboard' ? 'active' : ''}`}
              onClick={() => setActivePage('customerdashboard')}
              style={{
                background: activePage === 'customerdashboard' ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.04)',
                border: activePage === 'customerdashboard' ? '1px solid var(--gold-primary)' : '1px solid var(--border-light)',
                color: activePage === 'customerdashboard' ? 'var(--gold-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                padding: '6px 14px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>👤</span> My Bookings
            </button>
          ) : (
            <button
              onClick={onOpenCustomerLogin}
              style={{
                background: 'linear-gradient(135deg, var(--gold-primary), var(--rose-gold))',
                border: 'none',
                color: '#000',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '700',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                padding: '7px 16px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              🔑 Sign In
            </button>
          )}

          {loggedInArtist && activePage === 'artistportal' && (
            <button 
              className="luxe-btn" 
              onClick={onLogout}
              style={{ padding: '6px 14px', fontSize: '11px', letterSpacing: '1px' }}
            >
              Log Out ({loggedInArtist.name.split(' ')[0]})
            </button>
          )}
        </nav>
      </div>

      {/* Sub-navbar for logged-in artists within the portal */}
      {loggedInArtist && activePage === 'artistportal' && (
        <div className="sub-navbar" style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '15px', paddingTop: '12px', borderTop: '1px solid rgba(212, 175, 55, 0.15)', width: '100%' }}>
          <button 
            className={`sub-nav-link ${activeSubPage === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveSubPage('profile')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: activeSubPage === 'profile' ? 'var(--gold-primary)' : 'var(--text-muted)', 
              borderBottom: activeSubPage === 'profile' ? '2px solid var(--gold-primary)' : '2px solid transparent',
              cursor: 'pointer', 
              fontSize: '12px', 
              paddingBottom: '6px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              fontWeight: activeSubPage === 'profile' ? '600' : '400'
            }}
          >
            👤 Profile & Portfolio
          </button>
          <button 
            className={`sub-nav-link ${activeSubPage === 'packages' ? 'active' : ''}`}
            onClick={() => setActiveSubPage('packages')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: activeSubPage === 'packages' ? 'var(--gold-primary)' : 'var(--text-muted)', 
              borderBottom: activeSubPage === 'packages' ? '2px solid var(--gold-primary)' : '2px solid transparent',
              cursor: 'pointer', 
              fontSize: '12px', 
              paddingBottom: '6px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              fontWeight: activeSubPage === 'packages' ? '600' : '400'
            }}
          >
            💼 Packages & Pricing
          </button>
          <button 
            className={`sub-nav-link ${activeSubPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveSubPage('dashboard')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: activeSubPage === 'dashboard' ? 'var(--gold-primary)' : 'var(--text-muted)', 
              borderBottom: activeSubPage === 'dashboard' ? '2px solid var(--gold-primary)' : '2px solid transparent',
              cursor: 'pointer', 
              fontSize: '12px', 
              paddingBottom: '6px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              fontWeight: activeSubPage === 'dashboard' ? '600' : '400'
            }}
          >
            📈 Revenue & Approvals
          </button>
        </div>
      )}
    </header>
  );
}
