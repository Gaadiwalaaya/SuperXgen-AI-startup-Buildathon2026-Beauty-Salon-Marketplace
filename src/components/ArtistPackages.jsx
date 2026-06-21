import React, { useState } from 'react';

const TEMPLATES = [
  {
    id: "template-trad",
    name: "Royal Rajasthani Traditional HD",
    type: "Traditional",
    price: 45000,
    desc: "HD base makeup, designer dupatta/lehenga draping, antique jewelry setting, traditional hair bun with fresh jasmine mogra, longwear lash extensions."
  },
  {
    id: "template-air",
    name: "Couture Airbrush Bridal",
    type: "Airbrush",
    price: 60000,
    desc: "Transfer-resistant waterproof airbrush makeup, couture hair styling, premium Mink lashes, full jewelry setting and outfit draping."
  },
  {
    id: "template-cocktail",
    name: "Sangeet & Cocktail Shimmer Glam",
    type: "Bollywood",
    price: 30000,
    desc: "High-drama smokey/glitter eyes, full coverage glow base, voluminous waves, modern fusion drape."
  },
  {
    id: "template-spa",
    name: "Empress Pre-Bridal Glow Ritual",
    type: "Pre-Bridal",
    price: 25000,
    desc: "Premium gold glow facial, full body organic wrap, luxury pedicure & manicure, deep conditioning hair spa, stress-relief massage."
  }
];

export default function ArtistPackages({ artist, onUpdateArtist }) {
  const [packages, setPackages] = useState(artist.packages || []);
  
  // Editor States
  const [editingId, setEditingId] = useState(null);
  const [pkgName, setPkgName] = useState('');
  const [pkgType, setPkgType] = useState('Traditional');
  const [pkgPrice, setPkgPrice] = useState('');
  const [pkgDesc, setPkgDesc] = useState('');

  const handleLoadTemplate = (tpl) => {
    setPkgName(tpl.name);
    setPkgType(tpl.type);
    setPkgPrice(tpl.price);
    setPkgDesc(tpl.desc);
    setEditingId(null);
  };

  const handleSavePackage = (e) => {
    e.preventDefault();
    if (!pkgName || !pkgPrice || !pkgDesc) {
      alert("Please fill out all fields.");
      return;
    }

    let updatedPackages;
    if (editingId) {
      // Edit mode
      updatedPackages = packages.map(p => {
        if (p.id === editingId) {
          return {
            ...p,
            name: pkgName,
            type: pkgType,
            price: Number(pkgPrice),
            desc: pkgDesc
          };
        }
        return p;
      });
    } else {
      // Create mode
      const newPkg = {
        id: "PKG-" + Math.floor(1000 + Math.random() * 9000),
        name: pkgName,
        type: pkgType,
        price: Number(pkgPrice),
        desc: pkgDesc
      };
      updatedPackages = [...packages, newPkg];
    }

    setPackages(updatedPackages);
    saveToGlobal(updatedPackages);
    resetForm();
  };

  const handleEditClick = (p) => {
    setEditingId(p.id);
    setPkgName(p.name);
    setPkgType(p.type);
    setPkgPrice(p.price);
    setPkgDesc(p.desc);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm("Are you sure you want to remove this bridal package?")) {
      const updatedPackages = packages.filter(p => p.id !== id);
      setPackages(updatedPackages);
      saveToGlobal(updatedPackages);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setPkgName('');
    setPkgType('Traditional');
    setPkgPrice('');
    setPkgDesc('');
  };

  const saveToGlobal = (updatedPkgs) => {
    const updatedArtist = {
      ...artist,
      packages: updatedPkgs
    };
    onUpdateArtist(updatedArtist);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
      
      {/* Active Packages List */}
      <div className="glass-card ai-card" style={{ textAlign: 'left', height: 'fit-content' }}>
        <h4 className="font-serif gold-gradient-text" style={{ fontSize: '22px', marginBottom: '20px' }}>
          Active Service Packages
        </h4>

        {packages.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            You haven't defined any service packages yet. Select a template or write a custom package in the editor to start selling.
          </div>
        ) : (
          <div className="package-selectors">
            {packages.map(p => (
              <div key={p.id} className="package-card selected" style={{ cursor: 'default' }}>
                <div className="package-header">
                  <span style={{ color: '#fff' }}>{p.name}</span>
                  <span className="gold-gradient-text">₹{p.price.toLocaleString('en-IN')}</span>
                </div>
                <p className="package-desc" style={{ marginBottom: '15px' }}>{p.desc}</p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button className="action-btn approve" onClick={() => handleEditClick(p)} style={{ fontSize: '10px', padding: '4px 12px' }}>
                    Edit
                  </button>
                  <button className="action-btn decline" onClick={() => handleDeleteClick(p.id)} style={{ fontSize: '10px', padding: '4px 12px' }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Package Creator Form & Templates */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* Prebuilt Templates Quick loader */}
        <div className="glass-card ai-card" style={{ textAlign: 'left' }}>
          <h4 className="font-serif gold-gradient-text" style={{ fontSize: '20px', marginBottom: '15px' }}>
            Bridal Package Templates
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '15px' }}>
            Click to load a pre-configured bridal template, edit pricing and specifics, then save.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {TEMPLATES.map(tpl => (
              <button 
                key={tpl.id} 
                className="action-btn"
                onClick={() => handleLoadTemplate(tpl)}
                style={{ background: 'rgba(212, 175, 55, 0.05)', color: 'var(--gold-light)', border: '1px solid var(--border-gold)', padding: '6px 12px', fontSize: '11px', borderRadius: '15px' }}
              >
                + {tpl.name.split(' ')[0]} Look
              </button>
            ))}
          </div>
        </div>

        {/* Creator / Editor Form */}
        <div className="glass-card ai-card" style={{ textAlign: 'left' }}>
          <h4 className="font-serif gold-gradient-text" style={{ fontSize: '20px', marginBottom: '20px' }}>
            {editingId ? 'Edit Couture Package' : 'Create Custom Package'}
          </h4>

          <form onSubmit={handleSavePackage}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase' }}>Package Name</label>
              <input 
                type="text" 
                className="select-input" 
                placeholder="e.g. Royal Traditional HD Package" 
                value={pkgName}
                onChange={e => setPkgName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase' }}>Style Theme</label>
                <select 
                  className="select-input"
                  value={pkgType}
                  onChange={e => setPkgType(e.target.value)}
                >
                  <option value="Traditional">Traditional</option>
                  <option value="Pastel">Pastel</option>
                  <option value="Minimalist">Minimalist</option>
                  <option value="Bollywood">Bollywood</option>
                  <option value="Airbrush">Airbrush</option>
                  <option value="Pre-Bridal">Pre-Bridal</option>
                  <option value="Fusion">Fusion</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase' }}>Price (INR) *</label>
                <input 
                  type="number" 
                  className="select-input" 
                  placeholder="e.g. 45000" 
                  value={pkgPrice}
                  onChange={e => setPkgPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase' }}>Service Description (Included elements)</label>
              <textarea 
                className="select-input" 
                placeholder="Provide bullet points or detailed description of makeup, hair, draping services included..."
                rows="4"
                value={pkgDesc}
                onChange={e => setPkgDesc(e.target.value)}
                style={{ resize: 'vertical' }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="crimson-btn" style={{ flex: 1, padding: '12px' }}>
                {editingId ? 'Save Package Changes' : 'Publish Package'}
              </button>
              {editingId && (
                <button type="button" className="luxe-btn" onClick={resetForm} style={{ flex: 0.5 }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

      </div>

    </div>
  );
}
