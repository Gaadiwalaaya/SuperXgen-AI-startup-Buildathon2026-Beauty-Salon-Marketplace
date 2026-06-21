import React, { useState } from 'react';

export default function ArtistLoginModal({ onClose, onLoginSuccess }) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simple passcode check for demo purposes
    if (passcode === 'maharani2026') {
      onLoginSuccess();
    } else {
      setError('Invalid Access Key. Please try again.');
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-content glass-card" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h4 className="modal-title font-serif gold-gradient-text">Artist Security Gate</h4>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: '30px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
            The Artist Portal is restricted to registered Delhi makeup specialists. Please enter your registry access key.
          </p>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase' }}>
              Access Passcode
            </label>
            <input 
              type="password" 
              className="select-input" 
              placeholder="••••••••" 
              value={passcode} 
              onChange={e => {
                setPasscode(e.target.value);
                setError('');
              }}
              style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '18px' }}
            />
            {error && (
              <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px', fontWeight: '500' }}>
                ⚠️ {error}
              </p>
            )}
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
              Demo Key: <code style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--gold-light)' }}>maharani2026</code>
            </p>
          </div>

          <button 
            type="submit" 
            className="crimson-btn" 
            style={{ width: '100%', padding: '12px' }}
          >
            Authenticate Portal
          </button>
        </form>
      </div>
    </div>
  );
}
