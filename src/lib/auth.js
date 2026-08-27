/**
 * Client authentication provider with local persistence.
 */

const STORAGE_KEY = 'uspk_auth_user';

const defaultUser = {
  id: 'user_default',
  email: 'writer@uspk.app',
  displayName: 'Writer',
};

function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading auth user', e);
  }
  return defaultUser;
}

let currentUser = getStoredUser();
const listeners = new Set();

function notify() {
  listeners.forEach((cb) => {
    try {
      cb(currentUser);
    } catch (e) {
      console.error('Auth listener error', e);
    }
  });
}

export const auth = {
  getCurrentUser: () => currentUser,
  onAuthChange: (cb) => {
    listeners.add(cb);
    // Initial call
    cb(currentUser);
    return () => listeners.delete(cb);
  },
  signIn: async () => {
    currentUser = getStoredUser() || defaultUser;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
    } catch (e) {}
    notify();
    return currentUser;
  },
  signOut: async () => {
    currentUser = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    notify();
    return true;
  },
  isAppOwner: () => true,
};

export const adoptSession = () => Promise.resolve(true);
