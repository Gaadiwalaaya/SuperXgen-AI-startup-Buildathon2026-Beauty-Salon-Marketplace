import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import { artists as importedArtists } from './data/artists';
import ArtistAuth from './components/ArtistAuth';
import ArtistPackages from './components/ArtistPackages';
import ArtistDashboard from './components/ArtistDashboard';
import ArtistProfile from './components/ArtistProfile';
import CustomerDashboard from './components/CustomerDashboard';
import CustomerLoginModal from './components/CustomerLoginModal';
import Hero from './components/Hero';
import Directory from './components/Directory';
import BookingModal from './components/BookingModal';
import './App.css';

// Bump this version string any time DEFAULT_ARTISTS data changes.
// It forces localStorage to be cleared and re-seeded with fresh data.
const DATA_VERSION = "v5-expanded-artists";

// Sourced from data/artists.js and decorated with dummy auth fields
const DEFAULT_ARTISTS = importedArtists.map(a => ({
  ...a,
  email: a.email || `${a.id}@maharani.com`,
  phone: a.phone || "9988776655"
}));

// Initial mock bookings for the default artists
const DEFAULT_BOOKINGS = [
  {
    id: "BK-875142",
    artistId: "meenakshi-dutt",
    artistName: "Meenakshi Dutt Makeovers",
    packageName: "Royal Rajasthani Traditional HD",
    packagePrice: 45000,
    selectedDate: "June 12, 2026",
    selectedTime: "11:00 AM",
    clientName: "Aishwarya Rai",
    clientPhone: "9812345678",
    weddingLocation: "ITC Maurya Palace, Chanakyapuri",
    addons: [{ name: "Premium Hair Extensions Setting", price: 3500 }],
    totalPrice: 48500,
    status: "pending",
    timestamp: "2026-06-01"
  },
  {
    id: "BK-245196",
    artistId: "meenakshi-dutt",
    artistName: "Meenakshi Dutt Makeovers",
    packageName: "Couture Airbrush Bridal",
    packagePrice: 60000,
    selectedDate: "June 18, 2026",
    selectedTime: "09:00 AM",
    clientName: "Kiara Advani",
    clientPhone: "9876543210",
    weddingLocation: "Sainik Farms, South Delhi",
    addons: [],
    totalPrice: 60000,
    status: "pending",
    timestamp: "2026-06-02"
  },
  {
    id: "BK-902415",
    artistId: "meenakshi-dutt",
    artistName: "Meenakshi Dutt Makeovers",
    packageName: "Royal Rajasthani Traditional HD",
    packagePrice: 45000,
    selectedDate: "June 24, 2026",
    selectedTime: "01:00 PM",
    clientName: "Anushka Sen",
    clientPhone: "9555112233",
    weddingLocation: "The Oberoi, New Delhi",
    addons: [],
    totalPrice: 45000,
    status: "approved",
    timestamp: "2026-05-28"
  },
  {
    id: "BK-632514",
    artistId: "kritika-gill",
    artistName: "Kritika Gill Makeup",
    packageName: "Dewy Pastel Dream HD",
    packagePrice: 48000,
    selectedDate: "June 15, 2026",
    selectedTime: "07:00 AM",
    clientName: "Alia Bhatt",
    clientPhone: "9911883344",
    weddingLocation: "Vasant Kunj Farmhouse, Delhi",
    addons: [],
    totalPrice: 48000,
    status: "pending",
    timestamp: "2026-06-03"
  }
];

function App() {
  const [registeredArtists, setRegisteredArtists] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loggedInArtist, setLoggedInArtist] = useState(null);

  // Customer session – synced from localStorage (set by BookingModal auth step)
  const [loggedInCustomer, setLoggedInCustomer] = useState(() => {
    const saved = localStorage.getItem('maharani_customer');
    return saved ? JSON.parse(saved) : null;
  });

  // Controls the standalone customer login modal
  const [showCustomerLogin, setShowCustomerLogin] = useState(false);
  
  // Main page routing: 'home', 'artistportal', or 'customerdashboard'
  const [activePage, setActivePage] = useState('home');
  
  // Tabs within logged in artist portal: 'profile', 'packages', or 'dashboard'
  const [activeSubPage, setActiveSubPage] = useState('profile');
  
  // Selected artist for booking modal
  const [activeBookingArtist, setActiveBookingArtist] = useState(null);

  // Load datasets from local storage on mount
  useEffect(() => {
    // Version check: if the stored version doesn't match DATA_VERSION,
    // wipe the artist cache and re-seed with fresh defaults.
    const storedVersion = localStorage.getItem('maharani_data_version');
    const savedArtists = localStorage.getItem('maharani_registered_artists');

    if (storedVersion !== DATA_VERSION || !savedArtists) {
      // Clear stale data and re-seed
      localStorage.setItem('maharani_data_version', DATA_VERSION);
      localStorage.setItem('maharani_registered_artists', JSON.stringify(DEFAULT_ARTISTS));
      setRegisteredArtists(DEFAULT_ARTISTS);
    } else {
      setRegisteredArtists(JSON.parse(savedArtists));
    }

    const savedBookings = localStorage.getItem('maharani_bookings');
    if (savedBookings) {
      setBookings(JSON.parse(savedBookings));
    } else {
      setBookings(DEFAULT_BOOKINGS);
      localStorage.setItem('maharani_bookings', JSON.stringify(DEFAULT_BOOKINGS));
    }
  }, []);

  const handleLoginSuccess = (artist) => {
    setLoggedInArtist(artist);
    setActiveSubPage('profile');

    // Generate mock bookings specifically for newly registered artists so they have booking requests immediately
    const hasBookings = bookings.some(b => b.artistId === artist.id);
    if (!hasBookings) {
      const generatedMockBookings = [
        {
          id: "BK-" + Math.floor(100000 + Math.random() * 900000),
          artistId: artist.id,
          artistName: artist.name,
          packageName: "Royal Rajasthani Traditional HD",
          packagePrice: 45000,
          selectedDate: "June 15, 2026",
          selectedTime: "11:00 AM",
          clientName: "Janhvi Kapoor",
          clientPhone: "9922334455",
          weddingLocation: "Leela Palace, Chanakyapuri",
          addons: [{ name: "Premium Hair Extensions Setting", price: 3500 }],
          totalPrice: 48500,
          status: "pending",
          timestamp: new Date().toLocaleDateString()
        },
        {
          id: "BK-" + Math.floor(100000 + Math.random() * 900000),
          artistId: artist.id,
          artistName: artist.name,
          packageName: "Custom Airbrush Package",
          packagePrice: 55000,
          selectedDate: "June 22, 2026",
          selectedTime: "09:00 AM",
          clientName: "Sara Ali Khan",
          clientPhone: "9812981298",
          weddingLocation: "Taj Mahal Hotel, Mansingh Road",
          addons: [],
          totalPrice: 55000,
          status: "pending",
          timestamp: new Date().toLocaleDateString()
        }
      ];

      const newBookingsList = [...bookings, ...generatedMockBookings];
      setBookings(newBookingsList);
      localStorage.setItem('maharani_bookings', JSON.stringify(newBookingsList));
    }
  };

  const handleLogout = () => {
    setLoggedInArtist(null);
  };

  // Sync updated artist profile (e.g. customized packages list)
  const handleUpdateArtist = (updatedArtist) => {
    setLoggedInArtist(updatedArtist);
    
    const updatedArtistsList = registeredArtists.map(a => {
      if (a.id === updatedArtist.id) {
        return updatedArtist;
      }
      return a;
    });

    setRegisteredArtists(updatedArtistsList);
    localStorage.setItem('maharani_registered_artists', JSON.stringify(updatedArtistsList));
  };

  // Sync approved/declined/escrow/cancelled bookings
  const handleUpdateBookingStatus = (bookingId, status, cancelReason = '') => {
    const updatedBookingsList = bookings.map(b => {
      if (b.id === bookingId) {
        const updated = { ...b, status };
        if (cancelReason) {
          updated.cancelReason = cancelReason;
        }
        return updated;
      }
      return b;
    });
    setBookings(updatedBookingsList);
    localStorage.setItem('maharani_bookings', JSON.stringify(updatedBookingsList));
  };

  const handleBookingSuccess = (newBooking) => {
    const updated = [...bookings, newBooking];
    setBookings(updated);
    localStorage.setItem('maharani_bookings', JSON.stringify(updated));
    setActiveBookingArtist(null);
    // Re-sync customer session in case it was set during this booking flow
    const savedCustomer = localStorage.getItem('maharani_customer');
    if (savedCustomer) setLoggedInCustomer(JSON.parse(savedCustomer));
    alert(`Congratulations! Your bridal booking request (ID: ${newBooking.id}) for ${newBooking.packageName} has been submitted to ${newBooking.artistName}. They can now manage, approve, or cancel this booking under their Revenue & Approvals portal tab.`);
  };

  const handleCustomerLoginSuccess = (customer) => {
    setLoggedInCustomer(customer);
    setShowCustomerLogin(false);
    setActivePage('customerdashboard');
  };

  const handleCustomerLogout = () => {
    localStorage.removeItem('maharani_customer');
    setLoggedInCustomer(null);
    setActivePage('home');
  };

  const handleCancelBooking = (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking request?')) return;
    const updatedList = bookings.map(b =>
      b.id === bookingId ? { ...b, status: 'cancelled', cancelReason: 'Cancelled by customer' } : b
    );
    setBookings(updatedList);
    localStorage.setItem('maharani_bookings', JSON.stringify(updatedList));
  };

  return (
    <div className="app-container">
      <div className="sparkle-overlay"></div>

      {/* Navbar displays global branding & logout/tabs for logged-in users */}
      <Navbar 
        activePage={activePage}
        setActivePage={setActivePage}
        loggedInArtist={loggedInArtist}
        loggedInCustomer={loggedInCustomer}
        activeSubPage={activeSubPage}
        setActiveSubPage={setActiveSubPage}
        onLogout={handleLogout}
        onOpenCustomerLogin={() => setShowCustomerLogin(true)}
      />

      <main className="main-content">
        {activePage === 'home' && (
          /* Premium interactive landing hero & marketplace directory */
          <div>
            <Hero onStartQuiz={() => setActivePage('artistportal')} />
            <div style={{ padding: '0 30px 60px 30px' }}>
              <Directory 
                artists={registeredArtists}
                bookings={bookings}
                onBookArtist={(artist) => setActiveBookingArtist(artist)}
              />
            </div>
          </div>
        )}

        {activePage === 'customerdashboard' && loggedInCustomer && (
          <CustomerDashboard
            customer={loggedInCustomer}
            bookings={bookings}
            onCancelBooking={handleCancelBooking}
            onLogout={handleCustomerLogout}
          />
        )}

        {activePage === 'artistportal' && (
          /* activePage === 'artistportal' */
          <div>
            {!loggedInArtist ? (
              /* SHOW ONBOARDING INTAKE */
              <ArtistAuth 
                onLoginSuccess={handleLoginSuccess}
                registeredArtists={registeredArtists}
                setRegisteredArtists={setRegisteredArtists}
              />
            ) : (
              /* SHOW LOGGED-IN WORKSPACE */
              <div>
                {activeSubPage === 'profile' && (
                  <ArtistProfile 
                    artist={loggedInArtist}
                    onUpdateArtist={handleUpdateArtist}
                  />
                )}
                
                {activeSubPage === 'packages' && (
                  <ArtistPackages 
                    artist={loggedInArtist}
                    onUpdateArtist={handleUpdateArtist}
                  />
                )}
                
                {activeSubPage === 'dashboard' && (
                  <ArtistDashboard 
                    artist={loggedInArtist} 
                    bookings={bookings}
                    onUpdateBookingStatus={handleUpdateBookingStatus}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="footer-section">
        <div className="footer-logo gold-gradient-text font-serif">MAHARANI BRIDAL</div>
        <p style={{ letterSpacing: '2px', textTransform: 'uppercase', fontSize: '10px', marginBottom: '8px' }}>
          Delhi's Premier Wedding Beauty Registry - Artist Workspace
        </p>
        <p style={{ color: 'var(--text-muted)' }}>
          © 2026 Maharani Bridal. All rights reserved. Created for SuperXgen Hackathon.
        </p>
      </footer>

      {activeBookingArtist && (
        <BookingModal 
          artist={activeBookingArtist}
          onClose={() => setActiveBookingArtist(null)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {showCustomerLogin && (
        <CustomerLoginModal
          onLoginSuccess={handleCustomerLoginSuccess}
          onClose={() => setShowCustomerLogin(false)}
        />
      )}
    </div>
  );
}

export default App;
