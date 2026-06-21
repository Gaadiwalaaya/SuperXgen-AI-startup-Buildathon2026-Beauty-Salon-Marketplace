import React, { useState, useEffect, useRef } from 'react';

// Quiz options with visual mapping
const VIBE_OPTIONS = [
  { id: 'traditional', label: 'Royal Traditional', image: '/bride1.png', keywords: ['royal', 'traditional', 'heritage', 'classic', 'maharani'] },
  { id: 'modern', label: 'Modern Minimalist', image: '/bride3.png', keywords: ['modern', 'minimalist', 'pastel', 'dewy', 'elegant', 'subtle'] },
  { id: 'glam', label: 'Bollywood Glam', image: '/bride2.png', keywords: ['glamour', 'bollywood', 'celebrity', 'bold', 'hd', 'smokey'] }
];

const COLOR_OPTIONS = [
  { id: 'reds', label: 'Classic Reds & Golds', hex: 'linear-gradient(135deg, #c41e3a, #d4af37)' },
  { id: 'pastels', label: 'Soft Pastels & Ivories', hex: 'linear-gradient(135deg, #fadadd, #fffff0)' },
  { id: 'jewel', label: 'Deep Jewel Tones', hex: 'linear-gradient(135deg, #0b6623, #4b0082)' }
];

const EVENT_OPTIONS = [
  { id: 'day', label: 'Sunlit Day Wedding' },
  { id: 'night', label: 'Grand Night Reception' },
  { id: 'prewedding', label: 'Mehendi / Sangeet' }
];

const SKIN_OPTIONS = [
  { id: 'oily', label: 'Oily / Acne Prone', desc: 'Needs matte, long-lasting hold' },
  { id: 'dry', label: 'Dry / Flaky', desc: 'Needs deep hydration & dewy finish' },
  { id: 'normal', label: 'Normal / Combination', desc: 'Balanced skin type' }
];

const EYE_OPTIONS = [
  { id: 'smokey', label: 'Heavy Smokey Glam', emoji: '👁️', keywords: ['bold', 'smokey', 'dramatic'] },
  { id: 'shimmer', label: 'Subtle Shimmer & Glow', emoji: '✨', keywords: ['subtle', 'shimmer', 'soft'] },
  { id: 'winged', label: 'Classic Winged Liner', emoji: '🦋', keywords: ['classic', 'winged', 'sharp'] }
];

const HAIR_OPTIONS = [
  { id: 'bun', label: 'Classic Floral Bun (Gajra)', emoji: '🌸', keywords: ['traditional', 'bun', 'floral'] },
  { id: 'waves', label: 'Loose Hollywood Waves', emoji: '🌊', keywords: ['modern', 'waves', 'open hair'] },
  { id: 'messy', label: 'Messy Modern Updo', emoji: '🎀', keywords: ['contemporary', 'messy bun', 'updo'] }
];

export default function AIStyleFinder({ artists, onBookArtist, onCancel }) {
  const [step, setStep] = useState('quiz-vibe'); // quiz-vibe, quiz-colors, quiz-event, quiz-skin, quiz-eyes, quiz-hair, analyzing, persona, refining, results
  
  const [quizAnswers, setQuizAnswers] = useState({
    vibe: null,
    color: null,
    event: null,
    skin: null,
    eyes: null,
    hair: null
  });

  const [aiPersona, setAiPersona] = useState("");
  const [refinementText, setRefinementText] = useState("");
  const [matchedArtists, setMatchedArtists] = useState([]);
  
  // Ref to auto-scroll chat
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [step]);

  const handleQuizSelect = (field, value) => {
    setQuizAnswers(prev => ({ ...prev, [field]: value }));
  };

  const handleNextQuizStep = (currentStep) => {
    if (currentStep === 'quiz-vibe') setStep('quiz-colors');
    else if (currentStep === 'quiz-colors') setStep('quiz-event');
    else if (currentStep === 'quiz-event') setStep('quiz-skin');
    else if (currentStep === 'quiz-skin') setStep('quiz-eyes');
    else if (currentStep === 'quiz-eyes') setStep('quiz-hair');
    else if (currentStep === 'quiz-hair') {
      setStep('analyzing');
      setTimeout(() => generatePersona(), 2000);
    }
  };

  const generatePersona = (customFeedback = "") => {
    // A simple mock of AI generation
    const vibeDetails = VIBE_OPTIONS.find(v => v.id === quizAnswers.vibe);
    const skinDetails = SKIN_OPTIONS.find(s => s.id === quizAnswers.skin);
    const eyeDetails = EYE_OPTIONS.find(e => e.id === quizAnswers.eyes);
    const hairDetails = HAIR_OPTIONS.find(h => h.id === quizAnswers.hair);
    
    let personaText = `You are a visionary bride who desires a ${vibeDetails?.label || 'beautiful'} aesthetic. `;
    
    if (quizAnswers.color === 'pastels') {
      personaText += "You lean towards soft, ethereal hues, meaning your makeup should feature a flawless, luminous base. ";
    } else if (quizAnswers.color === 'reds') {
      personaText += "Embracing classic heritage colors, you need rich, transfer-proof makeup that holds its vibrancy. ";
    } else {
      personaText += "With deep jewel tones, a velvety finish will perfectly balance your grand ensemble. ";
    }

    // Add Skin logic
    if (quizAnswers.skin === 'oily') {
      personaText += "Given your skin concerns, our AI recommends a high-definition, mattifying airbrush technique to ensure zero shine in photos. ";
    } else if (quizAnswers.skin === 'dry') {
      personaText += "To combat dryness, we recommend intense pre-bridal skin prep and a deeply hydrating, glass-skin finish. ";
    }

    // Add Eye & Hair logic
    personaText += `Your vision includes ${eyeDetails?.label.toLowerCase() || 'beautiful eyes'} paired beautifully with a ${hairDetails?.label.toLowerCase() || 'stunning hairstyle'}. `;
    
    personaText += `Because this is for a ${EVENT_OPTIONS.find(e => e.id === quizAnswers.event)?.label || 'wedding'}, longevity and the right lighting adaptation are key.`;

    if (customFeedback) {
      personaText += ` \n\nWe've also noted your specific request: "${customFeedback}". Our artist matching algorithm has adjusted to prioritize this detail.`;
    }

    setAiPersona(personaText);
    setStep('persona');
  };

  const handleRefineSubmit = () => {
    if (!refinementText.trim()) return;
    setStep('analyzing');
    setTimeout(() => {
      generatePersona(refinementText);
      setRefinementText("");
    }, 1500);
  };

  const calculateMatches = () => {
    // Mock algorithm: We check artist specialty and about sections against the chosen vibe's keywords
    const selectedVibe = VIBE_OPTIONS.find(v => v.id === quizAnswers.vibe);
    const selectedEye = EYE_OPTIONS.find(e => e.id === quizAnswers.eyes);
    const selectedHair = HAIR_OPTIONS.find(h => h.id === quizAnswers.hair);
    
    let keywords = selectedVibe ? [...selectedVibe.keywords] : [];
    if (selectedEye) keywords.push(...selectedEye.keywords);
    if (selectedHair) keywords.push(...selectedHair.keywords);
    if (quizAnswers.skin === 'oily') keywords.push('matte', 'airbrush', 'hd');
    if (quizAnswers.skin === 'dry') keywords.push('dewy', 'hydrating', 'glow');

    // Also add feedback keywords if any
    let allKeywords = [...keywords];
    if (aiPersona.includes("specific request:")) {
      // Just a mock boost
      allKeywords.push('special', 'custom');
    }

    // Sort artists by match score
    const scoredArtists = artists.map(artist => {
      let score = 0;
      const textToSearch = (artist.specialty + " " + artist.about).toLowerCase();
      allKeywords.forEach(kw => {
        if (textToSearch.includes(kw)) score += 2;
      });
      // Give some random baseline so it's not empty
      score += Math.random(); 
      return { ...artist, matchScore: score };
    });

    const sortedMatches = scoredArtists.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
    setMatchedArtists(sortedMatches);
    setStep('results');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', position: 'relative' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 className="font-serif gold-gradient-text" style={{ fontSize: '28px', margin: '0 0 5px 0' }}>
            AI Style Discovery
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '13px' }}>
            Curating your bespoke bridal aesthetic
          </p>
        </div>
        <button onClick={onCancel} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '18px' }}>
          &times;
        </button>
      </div>

      <div 
        ref={containerRef}
        className="glass-card" 
        style={{ padding: '40px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}
      >
        
        {/* QUIZ STEP 1: VIBE */}
        {step === 'quiz-vibe' && (
          <div className="fade-in">
            <h3 className="font-serif" style={{ fontSize: '22px', color: '#fff', marginBottom: '20px', textAlign: 'center' }}>
              What is your primary bridal vibe?
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              {VIBE_OPTIONS.map(vibe => (
                <div 
                  key={vibe.id} 
                  onClick={() => handleQuizSelect('vibe', vibe.id)}
                  style={{
                    border: quizAnswers.vibe === vibe.id ? '2px solid var(--gold-primary)' : '1px solid var(--border-light)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    transform: quizAnswers.vibe === vibe.id ? 'scale(1.02)' : 'scale(1)',
                    opacity: quizAnswers.vibe && quizAnswers.vibe !== vibe.id ? 0.6 : 1
                  }}
                >
                  <img src={vibe.image} alt={vibe.label} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                  <div style={{ padding: '15px', textAlign: 'center', background: 'var(--bg-darker)' }}>
                    <h4 style={{ margin: 0, color: '#fff', fontSize: '14px' }}>{vibe.label}</h4>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <button 
                className="crimson-btn" 
                disabled={!quizAnswers.vibe}
                onClick={() => handleNextQuizStep('quiz-vibe')}
                style={{ padding: '12px 40px', opacity: quizAnswers.vibe ? 1 : 0.5 }}
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* QUIZ STEP 2: COLORS */}
        {step === 'quiz-colors' && (
          <div className="fade-in">
            <h3 className="font-serif" style={{ fontSize: '22px', color: '#fff', marginBottom: '20px', textAlign: 'center' }}>
              Select your outfit's dominant color palette
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              {COLOR_OPTIONS.map(color => (
                <div 
                  key={color.id} 
                  onClick={() => handleQuizSelect('color', color.id)}
                  style={{
                    border: quizAnswers.color === color.id ? '2px solid var(--gold-primary)' : '1px solid var(--border-light)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    transform: quizAnswers.color === color.id ? 'scale(1.02)' : 'scale(1)',
                    opacity: quizAnswers.color && quizAnswers.color !== color.id ? 0.6 : 1
                  }}
                >
                  <div style={{ width: '100%', height: '100px', background: color.hex }}></div>
                  <div style={{ padding: '15px', textAlign: 'center', background: 'var(--bg-darker)' }}>
                    <h4 style={{ margin: 0, color: '#fff', fontSize: '14px' }}>{color.label}</h4>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <button 
                className="crimson-btn" 
                disabled={!quizAnswers.color}
                onClick={() => handleNextQuizStep('quiz-colors')}
                style={{ padding: '12px 40px', opacity: quizAnswers.color ? 1 : 0.5 }}
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* QUIZ STEP 3: EVENT */}
        {step === 'quiz-event' && (
          <div className="fade-in">
            <h3 className="font-serif" style={{ fontSize: '22px', color: '#fff', marginBottom: '20px', textAlign: 'center' }}>
              When is the primary event taking place?
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px', marginBottom: '30px', maxWidth: '400px', margin: '0 auto 30px auto' }}>
              {EVENT_OPTIONS.map(event => (
                <button 
                  key={event.id} 
                  onClick={() => handleQuizSelect('event', event.id)}
                  className="luxe-btn"
                  style={{
                    padding: '20px',
                    textAlign: 'center',
                    background: quizAnswers.event === event.id ? 'rgba(212,175,55,0.15)' : 'transparent',
                    border: quizAnswers.event === event.id ? '1px solid var(--gold-primary)' : '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <span style={{ fontSize: '16px', color: quizAnswers.event === event.id ? '#fff' : 'var(--text-secondary)' }}>
                    {event.label}
                  </span>
                </button>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <button 
                className="crimson-btn" 
                disabled={!quizAnswers.event}
                onClick={() => handleNextQuizStep('quiz-event')}
                style={{ padding: '12px 40px', opacity: quizAnswers.event ? 1 : 0.5 }}
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* QUIZ STEP 4: SKIN CONCERNS */}
        {step === 'quiz-skin' && (
          <div className="fade-in">
            <h3 className="font-serif" style={{ fontSize: '22px', color: '#fff', marginBottom: '10px', textAlign: 'center' }}>
              What is your primary skin concern?
            </h3>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '20px', fontSize: '13px' }}>
              This helps the AI recommend the right base technique (Airbrush vs HD).
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
              {SKIN_OPTIONS.map(skin => (
                <div 
                  key={skin.id} 
                  onClick={() => handleQuizSelect('skin', skin.id)}
                  style={{
                    border: quizAnswers.skin === skin.id ? '2px solid var(--gold-primary)' : '1px solid var(--border-light)',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: quizAnswers.skin === skin.id ? 'rgba(212,175,55,0.05)' : 'transparent',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <h4 style={{ margin: '0 0 5px 0', color: '#fff', fontSize: '15px' }}>{skin.label}</h4>
                  <p style={{ margin: 0, color: 'var(--gold-light)', fontSize: '11px' }}>{skin.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <button 
                className="crimson-btn" 
                disabled={!quizAnswers.skin}
                onClick={() => handleNextQuizStep('quiz-skin')}
                style={{ padding: '12px 40px', opacity: quizAnswers.skin ? 1 : 0.5 }}
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* QUIZ STEP 5: EYE MAKEUP */}
        {step === 'quiz-eyes' && (
          <div className="fade-in">
            <h3 className="font-serif" style={{ fontSize: '22px', color: '#fff', marginBottom: '20px', textAlign: 'center' }}>
              How do you envision your eye makeup?
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
              {EYE_OPTIONS.map(eye => (
                <div 
                  key={eye.id} 
                  onClick={() => handleQuizSelect('eyes', eye.id)}
                  style={{
                    border: quizAnswers.eyes === eye.id ? '2px solid var(--gold-primary)' : '1px solid var(--border-light)',
                    borderRadius: '12px',
                    padding: '25px 15px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: quizAnswers.eyes === eye.id ? 'rgba(212,175,55,0.05)' : 'transparent',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ fontSize: '30px', marginBottom: '10px' }}>{eye.emoji}</div>
                  <h4 style={{ margin: 0, color: '#fff', fontSize: '14px' }}>{eye.label}</h4>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <button 
                className="crimson-btn" 
                disabled={!quizAnswers.eyes}
                onClick={() => handleNextQuizStep('quiz-eyes')}
                style={{ padding: '12px 40px', opacity: quizAnswers.eyes ? 1 : 0.5 }}
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* QUIZ STEP 6: HAIR VISION */}
        {step === 'quiz-hair' && (
          <div className="fade-in">
            <h3 className="font-serif" style={{ fontSize: '22px', color: '#fff', marginBottom: '20px', textAlign: 'center' }}>
              What is the vibe for your hairstyle?
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
              {HAIR_OPTIONS.map(hair => (
                <div 
                  key={hair.id} 
                  onClick={() => handleQuizSelect('hair', hair.id)}
                  style={{
                    border: quizAnswers.hair === hair.id ? '2px solid var(--gold-primary)' : '1px solid var(--border-light)',
                    borderRadius: '12px',
                    padding: '25px 15px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: quizAnswers.hair === hair.id ? 'rgba(212,175,55,0.05)' : 'transparent',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ fontSize: '30px', marginBottom: '10px' }}>{hair.emoji}</div>
                  <h4 style={{ margin: 0, color: '#fff', fontSize: '14px' }}>{hair.label}</h4>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <button 
                className="crimson-btn" 
                disabled={!quizAnswers.hair}
                onClick={() => handleNextQuizStep('quiz-hair')}
                style={{ padding: '12px 40px', opacity: quizAnswers.hair ? 1 : 0.5 }}
              >
                Analyze My Style
              </button>
            </div>
          </div>
        )}

        {/* ANALYZING STATE */}
        {step === 'analyzing' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <img src="/maharani_logo.png" alt="Loading" className="pulse-ring" style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '20px', padding: '10px', background: 'rgba(0,0,0,0.5)' }} />
            <h3 className="font-serif gold-gradient-text" style={{ fontSize: '24px' }}>AI is curating your look...</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Matching your aesthetic with Delhi's elite artists</p>
          </div>
        )}

        {/* PERSONA REVIEW */}
        {step === 'persona' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '30px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold-primary), var(--rose-gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '20px' }}>
                ✨
              </div>
              <div className="ai-card" style={{ background: 'rgba(20,20,20,0.8)', padding: '25px', borderRadius: '0 15px 15px 15px', border: '1px solid rgba(212,175,55,0.3)', position: 'relative' }}>
                <h4 className="font-serif" style={{ color: 'var(--gold-light)', margin: '0 0 10px 0', fontSize: '18px' }}>Your Bridal Persona Analysis</h4>
                <p style={{ color: '#fff', fontSize: '14px', lineHeight: '1.7', margin: 0, whiteSpace: 'pre-line' }}>
                  {aiPersona}
                </p>
              </div>
            </div>

            <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '30px' }}>
              <h4 style={{ color: '#fff', fontSize: '15px', textAlign: 'center', marginBottom: '20px' }}>Do you agree with this aesthetic?</h4>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button className="crimson-btn" onClick={calculateMatches} style={{ padding: '12px 30px' }}>
                  Yes, Show My Artists!
                </button>
                <button className="luxe-btn" onClick={() => setStep('refining')} style={{ padding: '12px 30px' }}>
                  No, I want to refine it
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REFINING / CHAT STEP */}
        {step === 'refining' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <h3 className="font-serif gold-gradient-text" style={{ fontSize: '22px', marginBottom: '15px' }}>Refine Your Vision</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '25px' }}>
              Tell our AI what's missing. Do you want more drama in the eyes? A softer lip? Mention specific details so we can adjust our matching algorithm.
            </p>
            
            <textarea 
              className="select-input"
              rows="5"
              placeholder="E.g., I actually want a very subtle nude lip, and I hate heavy contouring. Keep the skin looking like skin."
              value={refinementText}
              onChange={(e) => setRefinementText(e.target.value)}
              style={{ resize: 'vertical', marginBottom: '20px', fontSize: '14px' }}
            />
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                className="luxe-btn" 
                onClick={() => setStep('persona')}
                style={{ flex: 1, padding: '12px' }}
              >
                Cancel
              </button>
              <button 
                className="crimson-btn" 
                onClick={handleRefineSubmit}
                disabled={!refinementText.trim()}
                style={{ flex: 2, padding: '12px', opacity: refinementText.trim() ? 1 : 0.5 }}
              >
                Update My Persona
              </button>
            </div>
          </div>
        )}

        {/* RESULTS STEP */}
        {step === 'results' && (
          <div className="fade-in">
            <h3 className="font-serif gold-gradient-text" style={{ fontSize: '26px', marginBottom: '10px', textAlign: 'center' }}>
              Your Perfect Artist Matches
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '30px', textAlign: 'center' }}>
              Based on your unique persona, we've algorithmically selected these elite artists for you.
            </p>

            <div style={{ display: 'grid', gap: '20px' }}>
              {matchedArtists.map((artist, index) => (
                <div key={artist.id} style={{ display: 'flex', gap: '20px', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.08)', alignItems: 'center' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--border-gold)', flexShrink: 0 }}>
                    <img src={artist.image} alt={artist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 className="font-serif" style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#fff' }}>{artist.name}</h4>
                      <span style={{ fontSize: '11px', background: 'var(--gold-primary)', color: '#000', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                        {index === 0 ? '99% Match' : (90 - index * 5) + '% Match'}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--gold-light)' }}>✨ {artist.specialty}</p>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {artist.about}
                    </p>
                  </div>
                  <div>
                    <button 
                      className="crimson-btn"
                      onClick={() => onBookArtist(artist)}
                      style={{ padding: '8px 16px', fontSize: '12px', whiteSpace: 'nowrap' }}
                    >
                      View & Book
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <button className="luxe-btn" onClick={onCancel} style={{ padding: '10px 30px' }}>
                Return to Directory
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
