import React, { useState } from 'react';

const REGIONS = ["South Delhi", "Central Delhi", "West Delhi", "East Delhi", "North Delhi"];

export default function ArtistAuth({ onLoginSuccess, registeredArtists, setRegisteredArtists }) {
  const [isRegister, setIsRegister] = useState(false);
  
  // Registration Form States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [experience, setExperience] = useState('');
  const [region, setRegion] = useState('South Delhi');
  const [location, setLocation] = useState('');
  const [profileImage, setProfileImage] = useState('');
  

  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('maharani2026'); // default passcode
  const [error, setError] = useState('');



  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !experience || !location) {
      setError("Please fill in all required fields.");
      return;
    }

    // Check if artist already exists
    const exists = registeredArtists.some(artist => artist.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      setError("An artist with this email is already registered.");
      return;
    }

    const newArtistId = "MUA-" + Math.floor(1000 + Math.random() * 9000);
    const newArtist = {
      id: newArtistId,
      name: fullName,
      email: email,
      phone: phone,
      experience: experience + " Years",
      region: region,
      location: location,
      rating: 5.0,
      reviewsCount: 0,
      specialty: "Bridal Specialist",
      priceTier: "Standard",
      image: profileImage || "/bride6.png",
      gallery: [],
      packages: [], // empty packages list initially, they will customize it next!
      about: `Hello, I am ${fullName}, a professional bridal beauty artist. I specialize in luxury wedding makeovers across Delhi NCR. Contact me to reserve your bespoke sangeet, mehendi, or wedding day couture styling.`
    };

    // Save to global state & local storage
    const updated = [...registeredArtists, newArtist];
    setRegisteredArtists(updated);
    localStorage.setItem('maharani_registered_artists', JSON.stringify(updated));

    alert(`Congratulations! Registration successful. Your Unique Registry ID is: ${newArtistId}. Redirecting you to the portal...`);
    onLoginSuccess(newArtist);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!loginEmail) {
      setError("Please enter your registered email address.");
      return;
    }

    // For demo convenience, allow 'admin@maharani.com' or check registry
    let matchedArtist = registeredArtists.find(
      artist => artist.email.toLowerCase() === loginEmail.toLowerCase()
    );

    if (!matchedArtist && loginEmail.toLowerCase() === 'admin@maharani.com') {
      matchedArtist = registeredArtists[0]; // fallback
    }

    if (matchedArtist) {
      onLoginSuccess(matchedArtist);
    } else {
      setError("Email address not found. Register a new profile to get started.");
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto' }}>
      <div className="glass-card ai-card" style={{ textAlign: 'left', padding: '40px' }}>
        
        {/* Toggle Headings */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', marginBottom: '30px', paddingBottom: '10px' }}>
          <button 
            type="button"
            className={`font-serif`}
            style={{ 
              fontSize: '22px', 
              marginRight: '30px', 
              color: !isRegister ? 'var(--gold-primary)' : 'var(--text-secondary)',
              borderBottom: !isRegister ? '2px solid var(--gold-primary)' : 'none',
              paddingBottom: '8px'
            }}
            onClick={() => {
              setIsRegister(false);
              setError('');
            }}
          >
            Artist Login
          </button>
          <button 
            type="button"
            className={`font-serif`}
            style={{ 
              fontSize: '22px', 
              color: isRegister ? 'var(--gold-primary)' : 'var(--text-secondary)',
              borderBottom: isRegister ? '2px solid var(--gold-primary)' : 'none',
              paddingBottom: '8px'
            }}
            onClick={() => {
              setIsRegister(true);
              setError('');
            }}
          >
            Create Artist Profile
          </button>
        </div>

        {error && (
          <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', fontSize: '13px', marginBottom: '20px' }}>
            ⚠️ {error}
          </div>
        )}

        {/* LOGIN FORM */}
        {!isRegister ? (
          <form onSubmit={handleLoginSubmit}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '25px', lineHeight: '1.5' }}>
              Welcome back to the Delhi Bridal Registry. Log in to review client bookings and adjust packages.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase' }}>Email Address</label>
              <input 
                type="email" 
                className="select-input"
                placeholder="artist@example.com"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase' }}>Access Code (Registry Password)</label>
              <input 
                type="password" 
                className="select-input"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••••"
              />
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>
                Default Access Code: <code style={{ color: 'var(--gold-light)' }}>maharani2026</code>
              </p>
            </div>

            <button type="submit" className="crimson-btn" style={{ width: '100%', padding: '14px' }}>
              Log In to Dashboard
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button 
                type="button"
                style={{ fontSize: '12px', color: 'var(--gold-primary)' }}
                onClick={() => {
                  let demoArtist = registeredArtists.find(a => a.email.toLowerCase() === 'meenakshi@maharani.com');
                  if (!demoArtist) demoArtist = registeredArtists[0];
                  onLoginSuccess(demoArtist);
                }}
              >
                💡 Click for Demo Autologin (Meenakshi Dutt)
              </button>
            </div>
          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegisterSubmit}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '25px', lineHeight: '1.5' }}>
              Become a verified Maharani Partner. Creating a profile lists you in our directory, allowing brides to check your work and book custom packages.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase' }}>Full Name *</label>
                <input 
                  type="text" 
                  className="select-input" 
                  placeholder="e.g. Shweta Gaur" 
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase' }}>Email Address *</label>
                <input 
                  type="email" 
                  className="select-input" 
                  placeholder="name@mua.com" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase' }}>Phone Number *</label>
                <input 
                  type="tel" 
                  className="select-input" 
                  placeholder="9810XXXXXX" 
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase' }}>Years of Experience *</label>
                <input 
                  type="number" 
                  min="0"
                  max="40"
                  className="select-input" 
                  placeholder="e.g. 5" 
                  value={experience}
                  onChange={e => setExperience(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase' }}>Region (Delhi) *</label>
                <select 
                  className="select-input"
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                >
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase' }}>Studio Location / Address *</label>
                <input 
                  type="text" 
                  className="select-input" 
                  placeholder="e.g. GK-2 Main Market, South Delhi" 
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase' }}>Profile Photo URL</label>
              <input 
                type="text" 
                className="select-input" 
                placeholder="https://images.unsplash.com/photo-..." 
                value={profileImage}
                onChange={e => setProfileImage(e.target.value)}
              />
            </div>



            <button type="submit" className="crimson-btn" style={{ width: '100%', padding: '14px' }}>
              Create Profile & Proceed
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
