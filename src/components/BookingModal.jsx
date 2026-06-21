import React, { useState, useEffect } from 'react';

const TIME_SLOTS = [
  "07:00 AM", "09:00 AM", "11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM"
];

const ADDONS = [
  { id: "bridesmaid", name: "Bridesmaid Makeup & Hair", price: 8000 },
  { id: "hair-ext", name: "Premium Hair Extensions Setting", price: 3500 },
  { id: "drape-add", name: "Additional Family Draping (Per Person)", price: 2000 }
];

export default function BookingModal({ artist, onClose, onBookingSuccess }) {
  const [step, setStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState(artist.packages[0] || null);
  
  // Custom Calendar state
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  
  // Contact details
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [weddingLocation, setWeddingLocation] = useState('');
  const [selectedAddons, setSelectedAddons] = useState([]);

  // Customer authentication session state
  const [customerUser, setCustomerUser] = useState(() => {
    const saved = localStorage.getItem('maharani_customer');
    return saved ? JSON.parse(saved) : null;
  });

  // Prefill contact details if customer already logged in
  useEffect(() => {
    if (customerUser) {
      setClientName(customerUser.name || '');
      setClientPhone(customerUser.phone || '');
    }
  }, [customerUser]);

  // Login & Registration form inputs
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [isAuthRegister, setIsAuthRegister] = useState(false);
  const [authError, setAuthError] = useState('');

  // Mock calendar configuration for current month (June 2026)
  const daysInMonth = 30;
  const daysArray = Array.from({ length: daysInMonth }, (_, idx) => idx + 1);
  const bookedDays = [3, 7, 14, 21, 28]; // Sundays / Busy days

  const handleToggleAddon = (addon) => {
    if (selectedAddons.find(a => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const getAddonTotal = () => {
    return selectedAddons.reduce((acc, curr) => acc + curr.price, 0);
  };

  const calculateTotal = () => {
    if (!selectedPackage) return 0;
    return selectedPackage.price + getAddonTotal();
  };

  const handleNextStep = () => {
    if (step === 1 && !selectedPackage) return;
    if (step === 2 && (!selectedDay || !selectedTime)) {
      alert("Please select a date and time slot.");
      return;
    }
    if (step === 3 && (!clientName || !clientPhone || !weddingLocation)) {
      alert("Please enter all details to proceed.");
      return;
    }
    if (step === 4 && !customerUser) {
      alert("Please log in or register to proceed.");
      return;
    }
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleCustomerAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError('');

    if (isAuthRegister) {
      if (!authName || !authEmail || !authPhone || !authPassword) {
        setAuthError("Please fill out all registration fields.");
        return;
      }
      const newCustomer = { name: authName, email: authEmail, phone: authPhone };
      localStorage.setItem('maharani_customer', JSON.stringify(newCustomer));
      setCustomerUser(newCustomer);
      setClientName(authName);
      setClientPhone(authPhone);
      setStep(5); // Advance to receipt
    } else {
      if (!authEmail || !authPassword) {
        setAuthError("Please enter your email and password.");
        return;
      }
      // Simulate successful customer login
      const mockName = authEmail.split('@')[0].replace('.', ' ');
      const formattedName = mockName.charAt(0).toUpperCase() + mockName.slice(1);
      const matchedCustomer = { name: formattedName, email: authEmail, phone: '9876543210' };
      
      localStorage.setItem('maharani_customer', JSON.stringify(matchedCustomer));
      setCustomerUser(matchedCustomer);
      setClientName(formattedName);
      setClientPhone('9876543210');
      setStep(5); // Advance to receipt
    }
  };

  const handleCustomerLogout = () => {
    localStorage.removeItem('maharani_customer');
    setCustomerUser(null);
    setAuthEmail('');
    setAuthPassword('');
    setAuthName('');
    setAuthPhone('');
  };

  const handleConfirm = () => {
    const bookingDetails = {
      id: "BK-" + Math.floor(100000 + Math.random() * 900000),
      artistId: artist.id,
      artistName: artist.name,
      packageName: selectedPackage.name,
      packagePrice: selectedPackage.price,
      selectedDate: `June ${selectedDay}, 2026`,
      selectedTime,
      clientName,
      clientPhone,
      weddingLocation,
      addons: selectedAddons,
      totalPrice: calculateTotal(),
      status: 'pending',
      timestamp: new Date().toLocaleDateString()
    };

    // Save to local storage
    const currentBookings = JSON.parse(localStorage.getItem('maharani_bookings') || '[]');
    currentBookings.push(bookingDetails);
    localStorage.setItem('maharani_bookings', JSON.stringify(currentBookings));

    onBookingSuccess(bookingDetails);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card" style={{ padding: 0, maxWidth: '600px' }}>
        
        {/* Modal Header */}
        <div className="modal-header" style={{ padding: '20px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)' }}>
          <div>
            <h4 className="modal-title font-serif gold-gradient-text" style={{ fontSize: '20px', margin: 0 }}>Booking Studio</h4>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Reserving package with {artist.name}</p>
          </div>
          <button className="close-btn" onClick={onClose} style={{ fontSize: '24px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>&times;</button>
        </div>

        {/* Booking steps indicator */}
        <div className="booking-steps" style={{ display: 'flex', justifyContent: 'space-around', padding: '15px 20px', borderBottom: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.1)' }}>
          <div className={`booking-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`} style={{ fontSize: '11px', opacity: step >= 1 ? 1 : 0.4 }}>
            <span className="step-number">1</span> Package
          </div>
          <div className={`booking-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`} style={{ fontSize: '11px', opacity: step >= 2 ? 1 : 0.4 }}>
            <span className="step-number">2</span> Schedule
          </div>
          <div className={`booking-step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`} style={{ fontSize: '11px', opacity: step >= 3 ? 1 : 0.4 }}>
            <span className="step-number">3</span> Customize
          </div>
          <div className={`booking-step ${step >= 4 ? 'active' : ''} ${step > 4 ? 'completed' : ''}`} style={{ fontSize: '11px', opacity: step >= 4 ? 1 : 0.4 }}>
            <span className="step-number">4</span> Customer Auth
          </div>
          <div className={`booking-step ${step >= 5 ? 'active' : ''}`} style={{ fontSize: '11px', opacity: step >= 5 ? 1 : 0.4 }}>
            <span className="step-number">5</span> Review & Pay
          </div>
        </div>

        {/* Booking Body Content */}
        <div className="booking-body" style={{ padding: '25px' }}>
          
          {/* STEP 1: SELECT PACKAGE */}
          {step === 1 && (
            <div>
              <h5 className="font-serif" style={{ fontSize: '18px', marginBottom: '15px', textAlign: 'left' }}>Select Bridal Service Package</h5>
              <div className="package-selectors" style={{ display: 'grid', gap: '12px' }}>
                {artist.packages.map(p => (
                  <div 
                    key={p.id} 
                    className={`package-card ${selectedPackage?.id === p.id ? 'selected' : ''}`}
                    onClick={() => setSelectedPackage(p)}
                    style={{ 
                      padding: '15px', 
                      borderRadius: '8px', 
                      border: selectedPackage?.id === p.id ? '2px solid var(--border-gold)' : '1px solid var(--border-light)',
                      background: selectedPackage?.id === p.id ? 'rgba(212,175,55,0.05)' : 'rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div className="package-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#fff', fontWeight: '600' }}>{p.name}</span>
                      <span className="gold-gradient-text" style={{ fontWeight: '700' }}>₹{p.price.toLocaleString('en-IN')}</span>
                    </div>
                    <p className="package-desc" style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: SELECT DATE/TIME */}
          {step === 2 && (
            <div>
              <h5 className="font-serif" style={{ fontSize: '18px', marginBottom: '8px', textAlign: 'left' }}>Select Wedding / Event Date</h5>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '15px', textAlign: 'left' }}>June 2026 Availability Grid</p>
              
              <div className="calendar-grid">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <div key={i} className="calendar-header-day">{d}</div>
                ))}
                
                {daysArray.map(day => {
                  const isBooked = bookedDays.includes(day);
                  const isSelected = selectedDay === day;
                  
                  return (
                    <div 
                      key={day}
                      onClick={() => !isBooked && setSelectedDay(day)}
                      className={`calendar-day ${isBooked ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>

              {selectedDay && (
                <div style={{ marginTop: '25px', textAlign: 'left' }}>
                  <h5 className="font-serif" style={{ fontSize: '16px', marginBottom: '10px' }}>Select Trial or Ceremony Time Slot</h5>
                  <div className="time-slots">
                    {TIME_SLOTS.map(time => (
                      <div 
                        key={time}
                        className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: CUSTOMIZATION INFO */}
          {step === 3 && (
            <div>
              <h5 className="font-serif" style={{ fontSize: '18px', marginBottom: '15px', textAlign: 'left' }}>Event Customizations & Contact Info</h5>
              
              <div style={{ display: 'grid', gap: '15px', marginBottom: '25px', textAlign: 'left' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase' }}>Bride's / Client Name *</label>
                  <input 
                    type="text" 
                    className="select-input" 
                    value={clientName} 
                    onChange={e => setClientName(e.target.value)} 
                    placeholder="Enter bride's name"
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase' }}>Phone Number *</label>
                    <input 
                      type="tel" 
                      className="select-input" 
                      value={clientPhone} 
                      onChange={e => setClientPhone(e.target.value)} 
                      placeholder="9876543210"
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase' }}>Wedding Venue (Delhi NCR) *</label>
                    <input 
                      type="text" 
                      className="select-input" 
                      value={weddingLocation} 
                      onChange={e => setWeddingLocation(e.target.value)} 
                      placeholder="e.g. ITC Maurya Palace, Chanakyapuri"
                      required
                    />
                  </div>
                </div>
              </div>

              <h5 className="font-serif" style={{ fontSize: '16px', marginBottom: '10px', textAlign: 'left' }}>Optional Couture Addons</h5>
              <div className="addons-grid">
                {ADDONS.map(addon => {
                  const isSelected = selectedAddons.find(a => a.id === addon.id);
                  return (
                    <div 
                      key={addon.id} 
                      className={`addon-row ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleToggleAddon(addon)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input type="checkbox" checked={!!isSelected} readOnly />
                        <span style={{ fontSize: '13px', color: '#fff' }}>{addon.name}</span>
                      </div>
                      <span className="gold-gradient-text" style={{ fontSize: '13px', fontWeight: '600' }}>+ ₹{addon.price.toLocaleString('en-IN')}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: CUSTOMER LOGIN GATE */}
          {step === 4 && (
            <div style={{ textAlign: 'left' }}>
              {customerUser ? (
                <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                  <span style={{ fontSize: '48px', display: 'block', marginBottom: '15px' }}>🔐</span>
                  <h5 className="font-serif" style={{ fontSize: '20px', margin: '0 0 10px 0', color: 'var(--gold-primary)' }}>
                    Customer Account Verified
                  </h5>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '25px', lineHeight: '1.5' }}>
                    Welcome back! You are logged in as <strong>{customerUser.name}</strong> ({customerUser.email}).
                  </p>
                  
                  <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <button 
                      className="luxe-btn" 
                      onClick={handleCustomerLogout}
                      style={{ fontSize: '11px', padding: '8px 16px' }}
                    >
                      Switch Accounts / Log Out
                    </button>
                  </div>
                  
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '30px' }}>
                    Please click "Next Step" to review your booking receipt and make payment.
                  </p>
                </div>
              ) : (
                <div style={{ maxWidth: '420px', margin: '0 auto' }}>
                  <h5 className="font-serif gold-gradient-text" style={{ fontSize: '18px', marginBottom: '8px', textAlign: 'center' }}>
                    {isAuthRegister ? 'Create Customer Account' : 'Customer Registry Login'}
                  </h5>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '20px', textAlign: 'center', lineHeight: '1.4' }}>
                    You must authenticate your customer account to secure your booking and process the escrow payment.
                  </p>

                  {authError && (
                    <div style={{ padding: '10px 15px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', color: '#ef4444', fontSize: '13px', marginBottom: '15px' }}>
                      ⚠️ {authError}
                    </div>
                  )}

                  <form onSubmit={handleCustomerAuthSubmit}>
                    {isAuthRegister && (
                      <>
                        <div style={{ marginBottom: '15px' }}>
                          <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase' }}>Full Name *</label>
                          <input 
                            type="text" 
                            className="select-input" 
                            placeholder="e.g. Radhika Merchant"
                            value={authName}
                            onChange={e => setAuthName(e.target.value)}
                            required
                          />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                          <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase' }}>Phone Number *</label>
                          <input 
                            type="tel" 
                            className="select-input" 
                            placeholder="9810XXXXXX"
                            value={authPhone}
                            onChange={e => setAuthPhone(e.target.value)}
                            required
                          />
                        </div>
                      </>
                    )}

                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase' }}>Email Address *</label>
                      <input 
                        type="email" 
                        className="select-input" 
                        placeholder="bride@example.com"
                        value={authEmail}
                        onChange={e => setAuthEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase' }}>Registry Password *</label>
                      <input 
                        type="password" 
                        className="select-input" 
                        placeholder="••••••••"
                        value={authPassword}
                        onChange={e => setAuthPassword(e.target.value)}
                        required
                      />
                    </div>

                    <button type="submit" className="crimson-btn" style={{ width: '100%', padding: '12px', fontSize: '13px' }}>
                      {isAuthRegister ? 'Register & Continue' : 'Log In & Continue'}
                    </button>
                  </form>

                  <div style={{ textAlign: 'center', marginTop: '15px' }}>
                    <button 
                      type="button" 
                      onClick={() => { setIsAuthRegister(!isAuthRegister); setAuthError(''); }}
                      style={{ background: 'none', border: 'none', color: 'var(--gold-primary)', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      {isAuthRegister ? 'Already registered? Log In' : "New client? Create account"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: REVIEW RECEIPT & PAY */}
          {step === 5 && (
            <div>
              <h5 className="font-serif" style={{ fontSize: '18px', marginBottom: '15px', textAlign: 'center' }}>Verify & Secure Your Reservation</h5>
              
              <div className="receipt-card" style={{ textAlign: 'left', marginBottom: '20px' }}>
                <h6 className="receipt-title gold-gradient-text" style={{ fontSize: '14px', letterSpacing: '2px', textAlign: 'center', marginBottom: '15px' }}>MAHARANI BRIDAL INVITATION</h6>
                
                <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
                  <div className="receipt-row">
                    <span style={{ color: 'var(--text-secondary)' }}>Elite MUA Artist:</span>
                    <strong>{artist.name}</strong>
                  </div>
                  <div className="receipt-row">
                    <span style={{ color: 'var(--text-secondary)' }}>Selected Couture:</span>
                    <strong>{selectedPackage?.name}</strong>
                  </div>
                  <div className="receipt-row">
                    <span style={{ color: 'var(--text-secondary)' }}>Wedding Schedule:</span>
                    <strong>June {selectedDay}, 2026 at {selectedTime}</strong>
                  </div>
                  <div className="receipt-row">
                    <span style={{ color: 'var(--text-secondary)' }}>Client Details:</span>
                    <strong>{clientName} ({clientPhone})</strong>
                  </div>
                  <div className="receipt-row">
                    <span style={{ color: 'var(--text-secondary)' }}>Event Venue:</span>
                    <strong>{weddingLocation}</strong>
                  </div>
                </div>

                {selectedAddons.length > 0 && (
                  <div style={{ margin: '15px 0', padding: '10px 0', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
                    <p style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '5px' }}>Selected Add-ons</p>
                    {selectedAddons.map(addon => (
                      <div key={addon.id} className="receipt-row" style={{ fontSize: '12px' }}>
                        <span>- {addon.name}</span>
                        <span>₹{addon.price.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="receipt-total receipt-row" style={{ marginTop: '15px', borderTop: '2px solid var(--border-gold)', paddingTop: '15px', fontSize: '15px' }}>
                  <span>Total Deposit Amount:</span>
                  <span className="gold-gradient-text" style={{ fontSize: '18px', fontWeight: '700' }}>₹{calculateTotal().toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Escrow Disclaimer */}
              <div style={{
                background: 'rgba(212,175,55,0.05)',
                border: '1px solid rgba(212,175,55,0.2)',
                padding: '12px 15px',
                borderRadius: '6px',
                fontSize: '11px',
                color: 'var(--text-secondary)',
                lineHeight: '1.4',
                textAlign: 'left'
              }}>
                🔒 <strong>Maharani Escrow Safe:</strong> The deposit money will be kept safely in escrow by Maharani Bridal and will not be transferred to the artist until the wedding service is completed and both parties approve.
              </div>
            </div>
          )}

          {/* Navigation Controls inside booking modal */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
            {step > 1 ? (
              <button className="luxe-btn" onClick={handlePrevStep} style={{ padding: '8px 20px', fontSize: '12px' }}>
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button className="crimson-btn" onClick={handleNextStep} style={{ padding: '8px 20px', fontSize: '12px' }}>
                Next Step
              </button>
            ) : step === 4 ? (
              /* If customer is logged in, show Next button to proceed to receipt review, otherwise hide and use form submit */
              customerUser ? (
                <button className="crimson-btn" onClick={handleNextStep} style={{ padding: '8px 20px', fontSize: '12px' }}>
                  Next Step (Receipt)
                </button>
              ) : (
                <div />
              )
            ) : (
              <button className="crimson-btn" onClick={handleConfirm} style={{ padding: '8px 20px', fontSize: '12px', background: '#22c55e', borderColor: '#22c55e' }}>
                💳 Pay & Confirm Reservation
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
