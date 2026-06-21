import React from 'react';

export default function Hero({ onStartQuiz }) {
  return (
    <section className="hero-section">
      <p className="hero-subtitle">The Grandeur of Delhi Weddings</p>
      <h2 className="hero-title font-serif">
        Discover & Book Delhi's Elite <br />
        <span className="gold-gradient-text">Bridal Makeup Artists</span>
      </h2>
      <p className="hero-desc">
        Indulge in royal beauty curation. From majestic Rajasthani crimson to modern dewy champagne glam, find the perfect artist tailored for your dream look.
      </p>
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <button className="crimson-btn" onClick={onStartQuiz}>
          Find Your Look with AI
        </button>
      </div>
    </section>
  );
}
