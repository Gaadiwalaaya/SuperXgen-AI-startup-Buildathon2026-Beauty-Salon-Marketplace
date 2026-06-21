import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useChat — Demo-mode chat hook (no server required).
 *
 * Messages are stored in localStorage per roomId.
 * When the customer sends a message, the "artist" auto-replies after
 * a realistic delay with context-aware responses.
 *
 * The API is identical to the WebSocket version so ChatWindow.jsx is untouched.
 */

const STORAGE_KEY = (roomId) => `maharani_chat_messages_${roomId}`;

// ─── Smart auto-reply logic ───────────────────────────────────────────────────
const ARTIST_REPLIES = {
  // Keyword → reply (checked in order)
  trial: [
    "Absolutely! I recommend scheduling the trial session at least 2 weeks before the wedding date. This gives us time to do any adjustments. What date works for you? 📅",
    "For trials I typically need 2–3 hours. We'll go through the full bridal look and I'll note every product used so the wedding day is seamless. 💄",
  ],
  look: [
    "I'd love to understand your vision! Are you going for a traditional look — heavy eye makeup, deep lips — or something more dewy and contemporary? 🌸",
    "I can share my portfolio of recent bridal looks on WhatsApp too! What's your number? My recent brides have loved the 'Grand Duchess' and 'Rajkumari Rose' styles.",
  ],
  makeup: [
    "I work exclusively with MAC, Huda Beauty, and Charlotte Tilbury for the base. For eyes I prefer Sigma and Anastasia Beverly Hills — all long-lasting and photography-friendly. ✨",
    "Of course! I do airbrush finish as well if you prefer a flawless matte look that lasts 12+ hours — especially great for outdoor ceremonies.",
  ],
  hair: [
    "For hair I specialize in traditional juda styles, open waves with maang tikka setting, and braided updos. Do you have any reference images? You can describe them here! 👰",
    "I use Wella and L'Oréal Professionnel products. If you want hair extensions or clip-ins I can arrange those too — just let me know your hair length.",
  ],
  saree: [
    "Yes! I offer draping services for Kanjeevaram, Banarasi, and Lehenga styles. I can also do the complete bridal draping including duppatta setting and jewellery pinning. 🪡",
    "Saree draping takes around 30–45 minutes depending on the style. I'd suggest scheduling it right after the makeup session.",
  ],
  price: [
    "The package price is all-inclusive for what's listed. Add-ons like bridesmaid makeup and hair extensions are priced separately — you can see them in the booking details. 💰",
    "I don't charge extra for trial sessions within the city. Travel charges apply for venues beyond 30 km. Any other questions about pricing?",
  ],
  cost: [
    "All prices are transparent in the package — no hidden charges. The amount shown includes artist fees, products, and travel within city limits. 🙏",
  ],
  time: [
    "On the wedding day I typically arrive 4 hours before the ceremony. For a single bride, full bridal makeup + hair takes about 2.5–3 hours. 🕐",
    "I suggest we start no later than 6 AM for a noon ceremony — gives us buffer for touch-ups and photography!",
  ],
  product: [
    "I use a mix of luxury and professional brands: MAC for foundation, Huda Beauty for eyes, Charlotte Tilbury for skin prep. Everything is HD and photography-ready! 💋",
    "All products I use are hypoallergenic and patch-test safe. If you have any specific skin sensitivities, do let me know in advance.",
  ],
  location: [
    "I can travel to your venue! For locations within 30 km there's no extra charge. Beyond that, travel + accommodation is billed at actuals. Where's the venue? 📍",
    "I'm based in Delhi NCR but I've worked at venues in Jaipur, Chandigarh, and Agra. For destination weddings please book at least 3 months in advance.",
  ],
  date: [
    "That date works! 🎉 Once you confirm the booking, I'll block it on my calendar immediately. November–February is peak season so I'd suggest locking it in soon.",
    "I usually take 1–2 bookings per day maximum to ensure full attention to each bride. Let me check and confirm within the hour!",
  ],
  available: [
    "Yes, I'm available on that date! 🎉 November–February is peak bridal season so please confirm soon so I can block it exclusively for you.",
    "I have limited slots this season. Once you confirm and the booking is approved I'll reach out on WhatsApp to schedule the pre-wedding consultation.",
  ],
  hello: [
    "Hello! 🌸 So excited to potentially be your bridal artist! Tell me about your wedding — the date, venue, and the look you have in mind?",
    "Namaste! 🙏 Welcome! I'd love to know more about your wedding vision. Are you going for a traditional look or something more modern?",
  ],
  hi: [
    "Hi there! 💄 Thank you for reaching out! Tell me — what's your wedding date and what bridal look are you dreaming of?",
    "Hello beautiful bride-to-be! ✨ I'm so happy to chat. What can I help you with today?",
  ],
  thanks: [
    "You're most welcome! 🙏 Feel free to reach out anytime — I'm here to make your bridal day absolutely perfect! 💖",
    "Happy to help! 🌺 That's what I'm here for. Any other questions?",
  ],
  cancel: [
    "I completely understand plans can change. Please cancel through the app — if you cancel more than 30 days before, there's no fee. Closer to the date, a 20% retention applies. 🙏",
  ],
  default: [
    "Thank you for reaching out! 🌸 I'll get back to you with more details shortly. In the meantime, feel free to ask anything about the look, timeline, or products!",
    "Great question! I want to make sure your bridal day is absolutely perfect. Could you share a bit more so I can give you the best advice? 💄",
    "Absolutely! I'd love to help. Let me know all the details and I'll make sure everything is sorted for your special day! 👰",
    "Of course! That's a great thing to ask about. I'll send you more info — and please feel free to reach out on WhatsApp too for quick replies! 🌺",
  ],
};

function getArtistReply(text) {
  const lower = text.toLowerCase();
  for (const [keyword, replies] of Object.entries(ARTIST_REPLIES)) {
    if (keyword !== 'default' && lower.includes(keyword)) {
      return replies[Math.floor(Math.random() * replies.length)];
    }
  }
  const defaults = ARTIST_REPLIES.default;
  return defaults[Math.floor(Math.random() * defaults.length)];
}

function loadMessages(roomId) {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY(roomId)) || '[]');
  } catch {
    return [];
  }
}

function saveMessages(roomId, messages) {
  localStorage.setItem(STORAGE_KEY(roomId), JSON.stringify(messages));
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useChat(roomId, senderName, senderRole, enabled) {
  const [messages, setMessages]       = useState(() => loadMessages(roomId));
  const [status]                      = useState('open');   // always connected in demo mode
  const [members, setMembers]         = useState([{ name: senderName, role: senderRole }]);
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimerRef                = useRef(null);
  const replyTimerRef                 = useRef(null);

  // Sync messages from localStorage whenever another "tab" (or component) writes
  useEffect(() => {
    if (!enabled) return;
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY(roomId)) {
        setMessages(loadMessages(roomId));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [roomId, enabled]);

  const sendMessage = useCallback((text) => {
    if (!text.trim()) return;

    const newMessage = {
      id:         `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      roomId,
      senderName,
      senderRole,
      text: text.trim(),
      timestamp:  new Date().toISOString(),
    };

    setMessages(prev => {
      const updated = [...prev, newMessage];
      saveMessages(roomId, updated);
      return updated;
    });

    // ── Simulate artist auto-reply (only when customer sends) ──────────────
    if (senderRole === 'customer') {
      clearTimeout(replyTimerRef.current);

      // Show typing indicator after ~800ms
      const typingDelay = 800 + Math.random() * 600;
      replyTimerRef.current = setTimeout(() => {
        const artistName = 'Artist'; // generic — will be overridden by booking context
        setTypingUsers([artistName]);

        // Send reply after typing for 1.5–2.5s
        const replyDelay = 1500 + Math.random() * 1000;
        replyTimerRef.current = setTimeout(() => {
          setTypingUsers([]);

          const replyText = getArtistReply(text);
          const replyMsg = {
            id:         `${Date.now()}-reply-${Math.random().toString(36).slice(2)}`,
            roomId,
            senderName: artistName,
            senderRole: 'artist',
            text:       replyText,
            timestamp:  new Date().toISOString(),
          };

          setMessages(prev => {
            const updated = [...prev, replyMsg];
            saveMessages(roomId, updated);
            return updated;
          });
        }, replyDelay);
      }, typingDelay);
    }
  }, [roomId, senderName, senderRole]);

  const sendTyping = useCallback(() => {
    // No-op in demo mode — typing is simulated server-side
    clearTimeout(typingTimerRef.current);
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      clearTimeout(typingTimerRef.current);
      clearTimeout(replyTimerRef.current);
    };
  }, []);

  return { messages, status, members, typingUsers, sendMessage, sendTyping };
}
