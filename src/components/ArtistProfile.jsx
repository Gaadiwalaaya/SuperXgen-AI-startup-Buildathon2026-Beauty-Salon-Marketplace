import React, { useState } from 'react';

const REGIONS = ["South Delhi", "Central Delhi", "West Delhi", "East Delhi", "North Delhi"];
const PRICE_TIERS = ["Standard", "Premium", "Ultra Luxe"];

export default function ArtistProfile({ artist, onUpdateArtist }) {
  // Profile Form States
  const [name, setName] = useState(artist.name || '');
  const [phone, setPhone] = useState(artist.phone || '');
  const [experience, setExperience] = useState(artist.experience ? artist.experience.replace(' Years', '') : '');
  const [region, setRegion] = useState(artist.region || 'South Delhi');
  const [location, setLocation] = useState(artist.location || '');
  const [specialty, setSpecialty] = useState(artist.specialty || 'Bridal Specialist');
  const [priceTier, setPriceTier] = useState(artist.priceTier || 'Standard');
  const [about, setAbout] = useState(artist.about || '');
  const [image, setImage] = useState(artist.image || '');

  // Gallery States
  const [gallery, setGallery] = useState(artist.gallery || []);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  
  const [message, setMessage] = useState('');

  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    const updatedGallery = [...gallery, newPhotoUrl.trim()];
    setGallery(updatedGallery);
    setNewPhotoUrl('');
    
    // Auto save gallery updates
    const updatedArtist = {
      ...artist,
      gallery: updatedGallery
    };
    onUpdateArtist(updatedArtist);
    triggerSuccessMessage("Portfolio updated successfully!");
  };

  const handleRemovePhoto = (idx) => {
    const updatedGallery = gallery.filter((_, i) => i !== idx);
    setGallery(updatedGallery);
    
    // Auto save gallery updates
    const updatedArtist = {
      ...artist,
      gallery: updatedGallery
    };
    onUpdateArtist(updatedArtist);
    triggerSuccessMessage("Portfolio item removed.");
  };

  const triggerSuccessMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !phone || !location) {
      alert("Please fill in all required fields.");
      return;
    }

    const updatedArtist = {
      ...artist,
      name,
      phone,
      experience: experience + " Years",
      region,
      location,
      specialty,
      priceTier,
      about,
      image: image || "/bride6.png",
      gallery // sync latest gallery state
    };

    onUpdateArtist(updatedArtist);
    triggerSuccessMessage("Profile saved successfully!");
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
      
      {/* Edit Profile Details Form */}
      <div className="glass-card ai-card" style={{ textAlign: 'left', height: 'fit-content' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h4 className="font-serif gold-gradient-text" style={{ fontSize: '22px', margin: 0 }}>
            Registry Profile Details
          </h4>
          <span style={{ fontSize: '11px', color: 'var(--gold-light)', border: '1px solid var(--border-gold)', padding: '3px 8px', borderRadius: '4px' }}>
            ID: {artist.id}
          </span>
        </div>

        {message && (
          <div style={{ padding: '12px', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--border-gold)', borderRadius: '8px', color: 'var(--gold-light)', fontSize: '13px', marginBottom: '20px' }}>
            ✨ {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase' }}>Full Name *</label>
              <input 
                type="text" 
                className="select-input" 
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase' }}>Contact Phone *</label>
              <input 
                type="tel" 
                className="select-input" 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase' }}>Specialty / Signature Style</label>
              <input 
                type="text" 
                className="select-input" 
                placeholder="e.g. Royal Traditional Rajasthani"
                value={specialty}
                onChange={e => setSpecialty(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase' }}>Years of Experience</label>
              <input 
                type="number" 
                className="select-input" 
                value={experience}
                onChange={e => setExperience(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
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
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase' }}>Price Segment</label>
              <select 
                className="select-input"
                value={priceTier}
                onChange={e => setPriceTier(e.target.value)}
              >
                {PRICE_TIERS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase' }}>Studio / Salon Address *</label>
            <input 
              type="text" 
              className="select-input" 
              value={location}
              onChange={e => setLocation(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase' }}>Profile Photo URL</label>
            <input 
              type="text" 
              className="select-input" 
              value={image}
              onChange={e => setImage(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase' }}>About Bio (Showcased to brides)</label>
            <textarea 
              className="select-input" 
              rows="4"
              value={about}
              onChange={e => setAbout(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          <button type="submit" className="crimson-btn" style={{ width: '100%', padding: '12px' }}>
            Save Profile Details
          </button>
        </form>
      </div>

      {/* Portfolio Showcase Manager */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* Profile Card Preview */}
        <div className="glass-card ai-card" style={{ textAlign: 'left', background: 'linear-gradient(135deg, rgba(20,20,20,0.9) 0%, rgba(10,10,10,0.95) 100%)' }}>
          <h4 className="font-serif gold-gradient-text" style={{ fontSize: '18px', marginBottom: '15px' }}>
            Registry Preview
          </h4>
          
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--border-gold)', flexShrink: 0 }}>
              <img src={image || "/bride6.png"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Profile" />
            </div>
            <div>
              <h5 className="font-serif" style={{ fontSize: '18px', margin: '0 0 4px 0', color: '#fff' }}>{name || "Artist Name"}</h5>
              <p style={{ fontSize: '12px', color: 'var(--gold-light)', margin: '0 0 2px 0' }}>✨ {specialty} • {experience ? `${experience} Years Exp` : 'New Artist'}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>📍 {location || 'Delhi Region'}</p>
            </div>
          </div>
        </div>

        {/* Portfolio Gallery Upload & Manage */}
        <div className="glass-card ai-card" style={{ textAlign: 'left' }}>
          <h4 className="font-serif gold-gradient-text" style={{ fontSize: '20px', marginBottom: '10px' }}>
            Bridal Portfolio Showcase
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '20px' }}>
            Add URLs of your high-quality bridal makeovers. These will be shown on your public profile showcase.
          </p>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input 
              type="text" 
              className="select-input" 
              placeholder="Paste Image URL (e.g. Unsplash or Imgur link)..." 
              value={newPhotoUrl}
              onChange={e => setNewPhotoUrl(e.target.value)}
            />
            <button className="luxe-btn" onClick={handleAddPhoto} style={{ padding: '8px 16px', fontSize: '12px', whiteSpace: 'nowrap' }}>
              Add Look
            </button>
          </div>

          <h5 className="font-serif" style={{ fontSize: '14px', marginBottom: '15px', color: '#fff' }}>
            Gallery ({gallery.length} Images)
          </h5>

          {gallery.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', border: '1px dashed var(--border-light)', borderRadius: '8px', color: 'var(--text-muted)' }}>
              No portfolio photos uploaded yet. Add links above to showcase your work.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '12px' }}>
              {gallery.map((url, idx) => (
                <div key={idx} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-gold)' }}>
                  <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={`Portfolio ${idx}`} />
                  <button 
                    onClick={() => handleRemovePhoto(idx)}
                    style={{ 
                      position: 'absolute', 
                      top: '4px', 
                      right: '4px', 
                      background: 'rgba(239, 68, 68, 0.85)', 
                      color: '#fff', 
                      border: 'none', 
                      width: '18px', 
                      height: '18px', 
                      borderRadius: '50%', 
                      fontSize: '11px', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center' 
                    }}
                    title="Delete photo"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
