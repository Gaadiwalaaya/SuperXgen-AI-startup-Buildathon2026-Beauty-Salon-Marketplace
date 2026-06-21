/**
 * customerAuth.js
 * 
 * Simulates a "cloud" customer registry using localStorage.
 * 
 * In a real app this would be a database. Here, we store:
 *   - `maharani_customer_registry`  → { [email]: { name, phone, password } }
 *   - Each booking gets a `customerEmail` field when created
 * 
 * This means ANY login with the same email on ANY "device"
 * (same browser) will find the same bookings — simulating cross-device sync.
 */

const REGISTRY_KEY = 'maharani_customer_registry';

/** Load the full registry object */
function getRegistry() {
  try {
    return JSON.parse(localStorage.getItem(REGISTRY_KEY) || '{}');
  } catch {
    return {};
  }
}

/** Save the full registry */
function saveRegistry(registry) {
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
}

/**
 * Register a new customer.
 * Returns { success: true, customer } or { success: false, error }
 */
export function registerCustomer({ name, email, phone, password }) {
  if (!name || !email || !phone || !password) {
    return { success: false, error: 'All fields are required.' };
  }
  const registry = getRegistry();
  const key = email.toLowerCase().trim();

  if (registry[key]) {
    return { success: false, error: 'An account with this email already exists. Please log in.' };
  }

  const customer = { name, email: key, phone };
  registry[key] = { name, phone, password }; // store password (plain text is fine for simulation)
  saveRegistry(registry);

  // Persist active session
  localStorage.setItem('maharani_customer', JSON.stringify(customer));
  return { success: true, customer };
}

/**
 * Log in an existing customer.
 * Returns { success: true, customer } or { success: false, error }
 */
export function loginCustomer({ email, password }) {
  if (!email || !password) {
    return { success: false, error: 'Please enter your email and password.' };
  }
  const registry = getRegistry();
  const key = email.toLowerCase().trim();
  
  // Demo Login Override for Judges
  if (key === 'judge@hackathon.com' && password === 'judge2026') {
    const customer = { name: 'Demo Judge', email: key, phone: '9999999999' };
    localStorage.setItem('maharani_customer', JSON.stringify(customer));
    return { success: true, customer };
  }

  const record = registry[key];

  if (!record) {
    return { success: false, error: 'No account found with this email. Please register first.' };
  }
  if (record.password !== password) {
    return { success: false, error: 'Incorrect password. Please try again.' };
  }

  const customer = { name: record.name, email: key, phone: record.phone };
  localStorage.setItem('maharani_customer', JSON.stringify(customer));
  return { success: true, customer };
}

/**
 * Log out the active customer session.
 */
export function logoutCustomer() {
  localStorage.removeItem('maharani_customer');
}

/**
 * Get the currently active customer from session.
 */
export function getActiveCustomer() {
  try {
    const saved = localStorage.getItem('maharani_customer');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}
