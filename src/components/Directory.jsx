import React, { useState } from 'react';

export default function Directory({ artists, bookings, onBookArtist }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');
  
  // Expanded artist detail view state
  const [expandedArtistId, setExpandedArtistId] = useState(null);
  const [activeProfileArtist, setActiveProfileArtist] = useState(null);

  // Helper function to parse natural language search queries
  const parseSearchQuery = (query) => {
    if (!query) return { maxPrice: null, textQuery: '' };
    
    // Extract any number between 4 and 6 digits
    const priceMatch = query.match(/\b\d{4,6}\b/);
    const maxPrice = priceMatch ? parseInt(priceMatch[0], 10) : null;
    
    // Clean query by removing price and common noise words
    let cleaned = query.replace(/\b\d{4,6}\b/g, '');
    cleaned = cleaned.replace(/\b(under|below|for|budget|price|makeup|bridal|specialist|in|delhi|less|than|max|maximum)\b/gi, '');
    cleaned = cleaned.trim().replace(/\s+/g, ' ');
    
    return { maxPrice, textQuery: cleaned.toLowerCase() };
  };

  const { maxPrice: searchMaxPrice, textQuery: searchKeywords } = parseSearchQuery(searchQuery);

  // Filter logic
  const filteredArtists = artists.filter(artist => {
    // 1. Region Filter
    if (regionFilter !== 'all' && artist.region !== regionFilter) return false;

    // 2. Specialty Theme Filter
    if (specialtyFilter !== 'all') {
      const matchSpecialty = artist.specialty.toLowerCase().includes(specialtyFilter.toLowerCase()) ||
                             artist.packages.some(p => p.type.toLowerCase().includes(specialtyFilter.toLowerCase()));
      if (!matchSpecialty) return false;
    }

    // 3. Date Availability Filter
    if (dateFilter) {
      // Find if artist has any booking on this date that is approved or paid in escrow
      // June X, 2026 format matching
      const formattedDate = dateFilter.includes(',') ? dateFilter : `June ${parseInt(dateFilter.split('-')[2], 10)}, 2026`;
      const isAlreadyBooked = bookings.some(b => 
        b.artistId === artist.id && 
        b.selectedDate === formattedDate && 
        (b.status === 'approved' || b.status === 'paid_escrow')
      );
      if (isAlreadyBooked) return false;
    }

    // 4. Budget Filter
    const activeMaxBudget = budgetFilter ? Number(budgetFilter) : searchMaxPrice;
    if (activeMaxBudget) {
      const hasAffordablePackage = artist.packages.some(p => p.price <= activeMaxBudget);
      if (!hasAffordablePackage) return false;
    }

    // 5. Search Keyword matching (names, bio, packages)
    if (searchKeywords) {
      const nameMatch = artist.name.toLowerCase().includes(searchKeywords);
      const bioMatch = artist.about.toLowerCase().includes(searchKeywords);
      const specialtyMatch = artist.specialty.toLowerCase().includes(searchKeywords);
      const packageMatch = artist.packages.some(p => 
        p.name.toLowerCase().includes(searchKeywords) || 
        p.desc.toLowerCase().includes(searchKeywords) ||
        p.type.toLowerCase().includes(searchKeywords)
      );

      if (!nameMatch && !bioMatch && !specialtyMatch && !packageMatch) return false;
    }

    return true;
  });

  // Collect all specific matching packages directly if search keyword or budget is active
  // This satisfies "if the customer searched bridal makeup for 20000 we should show packages directly"
  const getMatchingPackages = () => {
    const activeMaxBudget = budgetFilter ? Number(budgetFilter) : searchMaxPrice;
    const list = [];
    
    // We only trigger this dedicated direct package display view if there's a budget or keyword search query
    if (!searchKeywords && !activeMaxBudget) return [];

    filteredArtists.forEach(artist => {
      artist.packages.forEach(p => {
        let isMatch = true;
        
        if (activeMaxBudget && p.price > activeMaxBudget) isMatch = false;
        
        if (searchKeywords) {
          const keywordMatch = 
            p.name.toLowerCase().includes(searchKeywords) ||
            p.desc.toLowerCase().includes(searchKeywords) ||
            p.type.toLowerCase().includes(searchKeywords) ||
            artist.name.toLowerCase().includes(searchKeywords);
          if (!keywordMatch) isMatch = false;
        }

        if (isMatch) {
          list.push({ artist, package: p });
        }
      });
    });

    return list;
  };

  const matchingPackages = getMatchingPackages();

  const handleClearFilters = () => {
    setSearchQuery('');
    setRegionFilter('all');
    setSpecialtyFilter('all');
    setDateFilter('');
    setBudgetFilter('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', padding: '10px 0' }}>
      
      {/* Search & Filter Controls Panel */}
      <div className="glass-card ai-card" style={{ textAlign: 'left', padding: '30px' }}>
        <h4 className="font-serif gold-gradient-text" style={{ fontSize: '22px', margin: '0 0 20px 0' }}>
          Refine Your Bridal Search
        </h4>

        {/* NLP Intelligent Search input */}
        <div style={{ marginBottom: '25px', position: 'relative' }}>
          <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Intelligent Query Search (Try typing: "traditional under 50000" or "airbrush bridal for 60000")
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              className="select-input" 
              placeholder="🔍 Search looks, styles, salons, or budgets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ fontSize: '15px', padding: '12px 15px' }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px', padding: '0 10px' }}
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {/* Grid Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
          
          {/* Filter 1: Region */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase' }}>Region (Delhi)</label>
            <select 
              className="select-input"
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
            >
              <option value="all">All Delhi Regions</option>
              <option value="South Delhi">South Delhi</option>
              <option value="Central Delhi">Central Delhi</option>
              <option value="West Delhi">West Delhi</option>
              <option value="East Delhi">East Delhi</option>
              <option value="North Delhi">North Delhi</option>
            </select>
          </div>

          {/* Filter 2: Specialty Theme */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase' }}>Style Specialty</label>
            <select 
              className="select-input"
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
            >
              <option value="all">All Style Specialties</option>
              <option value="Traditional">Traditional Rajasthani/HD</option>
              <option value="Pastel">Dewy Pastel / Soft Glam</option>
              <option value="Minimalist">Modern Minimalist</option>
              <option value="Bollywood">Bollywood / Glam Shimmer</option>
              <option value="Airbrush">Airbrush technique</option>
              <option value="Pre-Bridal">Pre-Bridal Spa & Glow</option>
            </select>
          </div>

          {/* Filter 3: Date Availability */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase' }}>Wedding Date</label>
            <input 
              type="date" 
              className="select-input"
              value={dateFilter}
              min="2026-06-01"
              max="2026-06-30"
              onChange={(e) => setDateFilter(e.target.value)}
            />
            <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>Filters out booked artists</span>
          </div>

          {/* Filter 4: Budget Max */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase' }}>Max Budget (INR)</label>
            <input 
              type="number" 
              className="select-input"
              placeholder="e.g. 50000"
              value={budgetFilter}
              onChange={(e) => setBudgetFilter(e.target.value)}
            />
          </div>

        </div>

        {/* Clear Filters indicator */}
        {(searchQuery || regionFilter !== 'all' || specialtyFilter !== 'all' || dateFilter || budgetFilter) && (
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--gold-light)' }}>
              Active filters applied. Showing {matchingPackages.length > 0 ? `${matchingPackages.length} packages` : `${filteredArtists.length} artists`}.
            </span>
            <button 
              onClick={handleClearFilters}
              style={{ background: 'none', border: 'none', color: '#ef4444', textDecoration: 'underline', fontSize: '12px', cursor: 'pointer' }}
            >
              Clear All Filters
            </button>
          </div>
        )}

      </div>

      {/* Results Rendering */}
      <div>
        {/* CASE A: Specific package search results (highly targeted) */}
        {matchingPackages.length > 0 ? (
          <div>
            <h3 className="font-serif" style={{ fontSize: '26px', marginBottom: '24px', textAlign: 'left', borderLeft: '4px solid var(--gold-primary)', paddingLeft: '15px', color: '#fff' }}>
              Direct Package Matches
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
              {matchingPackages.map(({ artist, package: p }) => (
                <div key={p.id} className="glass-card package-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'left', padding: '25px', position: 'relative' }}>
                  
                  {/* Theme Badge */}
                  <span style={{ position: 'absolute', top: '15px', right: '15px', fontSize: '10px', textTransform: 'uppercase', background: 'rgba(212,175,55,0.1)', color: 'var(--gold-light)', border: '1px solid var(--border-gold)', padding: '2px 8px', borderRadius: '4px' }}>
                    {p.type}
                  </span>

                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                      By {artist.name}
                    </div>
                    <h4 className="font-serif" style={{ fontSize: '20px', color: '#fff', margin: '0 0 10px 0' }}>
                      {p.name}
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
                      {p.desc}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Package Price</span>
                      <span className="gold-gradient-text" style={{ fontSize: '22px', fontWeight: 'bold' }}>
                        ₹{p.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                    
                    <button 
                      className="crimson-btn" 
                      onClick={() => onBookArtist(artist)}
                      style={{ padding: '8px 18px', fontSize: '12px' }}
                    >
                      Book Couture Look
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>
        ) : (
          /* CASE B: Browse Artist Directory Cards */
          <div>
            <h3 className="font-serif" style={{ fontSize: '26px', marginBottom: '24px', textAlign: 'left', borderLeft: '4px solid var(--gold-primary)', paddingLeft: '15px', color: '#fff' }}>
              Delhi's Elite Makeup Artists
            </h3>

            {filteredArtists.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 40px', border: '1px dashed var(--border-gold)', borderRadius: '10px', color: 'var(--text-secondary)' }}>
                <p style={{ fontSize: '16px', margin: '0 0 10px 0' }}>No registered makeup artists found matching your criteria.</p>
                <button onClick={handleClearFilters} className="luxe-btn" style={{ fontSize: '12px' }}>Reset Search Filters</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '30px' }}>
                {filteredArtists.map(artist => {
                  const isExpanded = expandedArtistId === artist.id;
                  
                  return (
                    <div key={artist.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: 'fit-content', overflow: 'hidden' }}>
                      
                      {/* Image container & metadata */}
                      <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                        <img 
                          src={artist.image} 
                          alt={artist.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                        <span className="artist-badge" style={{ position: 'absolute', bottom: '15px', right: '15px', background: 'var(--bg-darker)', color: 'var(--gold-primary)', border: '1px solid var(--border-gold)', padding: '4px 10px', fontSize: '10px', textTransform: 'uppercase', borderRadius: '4px', letterSpacing: '1px' }}>
                          {artist.priceTier}
                        </span>
                        <span style={{ position: 'absolute', top: '15px', left: '15px', background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '3px 8px', fontSize: '10px', borderRadius: '4px' }}>
                          📍 {artist.region}
                        </span>
                      </div>

                      {/* Info body */}
                      <div style={{ padding: '25px', textAlign: 'left' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ color: 'var(--gold-light)', fontSize: '12px' }}>
                            ★ {artist.rating} ({artist.reviewsCount} verified reviews)
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            ID: {artist.id}
                          </span>
                        </div>

                        <h4 className="font-serif" style={{ fontSize: '22px', margin: '0 0 5px 0', color: '#fff' }}>
                          {artist.name}
                        </h4>
                        
                        <p style={{ fontSize: '13px', color: 'var(--gold-primary)', fontWeight: '500', margin: '0 0 15px 0' }}>
                          ✨ Specialty: {artist.specialty} ({artist.experience || "Multiple Years Experience"})
                        </p>

                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
                          {artist.about}
                        </p>

                        <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                          <button 
                            className="luxe-btn" 
                            onClick={() => setExpandedArtistId(isExpanded ? null : artist.id)}
                            style={{ flex: 1.2, padding: '10px', fontSize: '11px', whiteSpace: 'nowrap' }}
                          >
                            {isExpanded ? 'Hide Details' : 'Looks & Packages'}
                          </button>
                          <button 
                            className="luxe-btn" 
                            onClick={() => setActiveProfileArtist(artist)}
                            style={{ flex: 1, padding: '10px', fontSize: '11px', background: 'rgba(212,175,55,0.15)', border: '1px solid var(--border-gold)', color: 'var(--gold-light)' }}
                          >
                            👤 Full Profile
                          </button>
                        </div>

                        {/* Collapsible Details & Showcase */}
                        {isExpanded && (
                          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed rgba(212,175,55,0.2)' }}>
                            
                            {/* Showcase Gallery */}
                            <h5 className="font-serif" style={{ fontSize: '15px', color: 'var(--gold-light)', margin: '0 0 10px 0' }}>
                              Bridal Portfolio Gallery
                            </h5>
                            
                            {artist.gallery && artist.gallery.length > 0 ? (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
                                {artist.gallery.map((img, idx) => (
                                  <div key={idx} style={{ aspectRatio: '1/1', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(212,175,55,0.1)' }}>
                                    <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="look" />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '20px' }}>No showcase looks added by this artist yet.</p>
                            )}

                            {/* Package details */}
                            <h5 className="font-serif" style={{ fontSize: '15px', color: 'var(--gold-light)', margin: '0 0 10px 0' }}>
                              Available Couture Packages
                            </h5>

                            {artist.packages && artist.packages.length > 0 ? (
                              <div style={{ display: 'grid', gap: '12px' }}>
                                {artist.packages.map(p => (
                                  <div key={p.id} style={{ padding: '12px', border: '1px solid var(--border-light)', borderRadius: '6px', background: 'rgba(0,0,0,0.1)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                      <strong style={{ fontSize: '13px', color: '#fff' }}>{p.name}</strong>
                                      <span className="gold-gradient-text" style={{ fontSize: '13px', fontWeight: 'bold' }}>
                                        ₹{p.price.toLocaleString('en-IN')}
                                      </span>
                                    </div>
                                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 10px 0' }}>{p.desc}</p>
                                    <button 
                                      className="crimson-btn" 
                                      onClick={() => onBookArtist(artist)}
                                      style={{ padding: '5px 12px', fontSize: '10px' }}
                                    >
                                      Book This Package
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No service packages defined yet.</p>
                            )}

                          </div>
                        )}

                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ARTIST FULL PROFILE MODAL OVERLAY */}
      {activeProfileArtist && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-card ai-card" style={{
            maxWidth: '850px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid var(--border-gold)',
            boxShadow: '0 15px 40px rgba(0,0,0,0.6)',
            padding: 0
          }}>
            {/* Banner Header */}
            <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
              <img 
                src={activeProfileArtist.gallery && activeProfileArtist.gallery[0] ? activeProfileArtist.gallery[0] : activeProfileArtist.image} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }} 
                alt="Banner" 
              />
              <button 
                onClick={() => setActiveProfileArtist(null)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  border: '1px solid var(--border-light)',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  fontSize: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                &times;
              </button>
              
              <div style={{ position: 'absolute', bottom: '20px', left: '30px', textAlign: 'left', display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--border-gold)', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', flexShrink: 0 }}>
                  <img src={activeProfileArtist.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Profile" />
                </div>
                <div>
                  <h3 className="font-serif" style={{ fontSize: '28px', color: '#fff', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                    {activeProfileArtist.name}
                  </h3>
                  <p style={{ color: 'var(--gold-light)', margin: '5px 0 0 0', fontSize: '13px', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                    ★ {activeProfileArtist.rating} ({activeProfileArtist.reviewsCount} verified reviews) • {activeProfileArtist.priceTier}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div style={{ padding: '35px', textAlign: 'left', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
              
               {/* Left Column: Bio & Portfolio Showcase */}
              <div>
                <h4 className="font-serif gold-gradient-text" style={{ fontSize: '18px', margin: '0 0 10px 0' }}>
                  Artist Biography
                </h4>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '25px' }}>
                  {activeProfileArtist.about}
                </p>

                <h4 className="font-serif gold-gradient-text" style={{ fontSize: '18px', margin: '0 0 15px 0' }}>
                  Bridal Portfolio Showcase ({activeProfileArtist.gallery?.length || 0} Looks)
                </h4>
                
                {activeProfileArtist.gallery && activeProfileArtist.gallery.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px' }}>
                    {activeProfileArtist.gallery.map((img, idx) => (
                      <div key={idx} style={{ aspectRatio: '1/1', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(212,175,55,0.2)' }}>
                        <a href={img} target="_blank" rel="noreferrer">
                          <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} alt="showcase look" />
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '20px', border: '1px dashed var(--border-light)', borderRadius: '6px', color: 'var(--text-muted)', fontSize: '12px' }}>
                    No portfolio images added by this artist yet.
                  </div>
                )}
              </div>

              {/* Right Column: Active Packages & Metadata */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                <div>
                  <h4 className="font-serif gold-gradient-text" style={{ fontSize: '18px', margin: '0 0 12px 0' }}>
                    Registry Info
                  </h4>
                  <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <div>📍 <strong>Address:</strong> {activeProfileArtist.location} ({activeProfileArtist.region})</div>
                    <div>💼 <strong>Experience:</strong> {activeProfileArtist.experience}</div>
                    <div>✨ <strong>Signature style:</strong> {activeProfileArtist.specialty}</div>
                    <div>📧 <strong>Registry Email:</strong> {activeProfileArtist.email}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-serif gold-gradient-text" style={{ fontSize: '18px', margin: '0 0 15px 0' }}>
                    Active Couture Packages
                  </h4>

                  {activeProfileArtist.packages && activeProfileArtist.packages.length > 0 ? (
                    <div style={{ display: 'grid', gap: '15px' }}>
                      {activeProfileArtist.packages.map(p => (
                        <div key={p.id} style={{ padding: '15px', border: '1px solid var(--border-gold)', borderRadius: '8px', background: 'rgba(212,175,55,0.02)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                            <strong style={{ fontSize: '14px', color: '#fff' }}>{p.name}</strong>
                            <span className="gold-gradient-text" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                              ₹{p.price.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 12px 0', lineHeight: '1.5' }}>{p.desc}</p>
                          <button 
                            className="crimson-btn" 
                            onClick={() => {
                              setActiveProfileArtist(null); // Close profile modal
                              onBookArtist(activeProfileArtist); // Open booking modal
                            }}
                            style={{ padding: '6px 14px', fontSize: '11px', width: '100%' }}
                          >
                            Book This Look
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '20px', border: '1px dashed var(--border-light)', borderRadius: '6px', color: 'var(--text-muted)', fontSize: '12px' }}>
                      No packages defined yet by this artist.
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
