import React, { useState } from 'react';
import { registerCustomer, loginCustomer } from '../utils/customerAuth';

export default function CustomerLoginModal({ onLoginSuccess, onClose }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [phone, setPhone]       = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      // Simulate a brief "network" delay for realism
      let result;
      if (mode === 'register') {
        result = registerCustomer({ name, email, phone, password });
      } else {
        result = loginCustomer({ email, password });
      }

      setLoading(false);
      if (result.success) {
        onLoginSuccess(result.customer);
      } else {
        setError(result.error);
      }
    }, 600);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content glass-card"
        style={{ maxWidth: '420px', padding: 0 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '22px 26px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <h4 className="font-serif gold-gradient-text" style={{ fontSize: '20px', margin: 0 }}>
              {mode === 'login' ? 'Customer Sign In' : 'Create Account'}
            </h4>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              {mode === 'login'
                ? 'Access your bridal bookings from any device'
                : 'Join Maharani Bridal Registry'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '24px', cursor: 'pointer', lineHeight: 1 }}
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '28px 26px' }}>

          {/* Mode toggle pills */}
          <div style={{
            display: 'flex', background: 'rgba(255,255,255,0.04)',
            borderRadius: '10px', padding: '4px', marginBottom: '24px',
          }}>
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1, padding: '8px', borderRadius: '7px',
                  border: 'none', cursor: 'pointer',
                  background: mode === m ? 'linear-gradient(135deg, var(--gold-primary), var(--rose-gold))' : 'transparent',
                  color: mode === m ? '#000' : 'var(--text-secondary)',
                  fontWeight: mode === m ? '700' : '400',
                  fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase',
                  transition: 'all 0.2s ease',
                }}
              >
                {m === 'login' ? '🔑 Sign In' : '✨ Register'}
              </button>
            ))}
          </div>

          {error && (
            <div style={{
              padding: '10px 14px', marginBottom: '16px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px', color: '#ef4444', fontSize: '13px',
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
            {mode === 'register' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text" className="select-input"
                    placeholder="e.g. Priya Sharma"
                    value={name} onChange={e => setName(e.target.value)} required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel" className="select-input"
                    placeholder="9810XXXXXX"
                    value={phone} onChange={e => setPhone(e.target.value)} required
                  />
                </div>
              </>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                Email Address *
              </label>
              <input
                type="email" className="select-input"
                placeholder="bride@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                Password *
              </label>
              <input
                type="password" className="select-input"
                placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required
              />
            </div>

            <button
              type="submit"
              className="crimson-btn"
              disabled={loading}
              style={{ padding: '13px', fontSize: '13px', marginTop: '4px', opacity: loading ? 0.7 : 1 }}
            >
              {loading
                ? '⏳ Connecting…'
                : mode === 'login' ? '🔑 Sign In & View Bookings' : '✨ Create Account & Continue'}
            </button>
            
            {mode === 'login' && (
              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <button 
                  type="button"
                  style={{ fontSize: '12px', color: 'var(--gold-primary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => {
                    setEmail('judge@hackathon.com');
                    setPassword('judge2026');
                  }}
                >
                  💡 Click for Quick Demo Login (Judges)
                </button>
              </div>
            )}
          </form>

          <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', marginTop: '18px', lineHeight: '1.6' }}>
            🔒 Your account is secured by Maharani Bridal Registry.{' '}
            {mode === 'login'
              ? <span>New here? <button onClick={() => setMode('register')} style={{ background: 'none', border: 'none', color: 'var(--gold-primary)', cursor: 'pointer', fontSize: '11px', textDecoration: 'underline' }}>Create an account</button></span>
              : <span>Already registered? <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: 'var(--gold-primary)', cursor: 'pointer', fontSize: '11px', textDecoration: 'underline' }}>Sign in</button></span>
            }
          </p>
        </div>
      </div>
    </div>
  );
}
