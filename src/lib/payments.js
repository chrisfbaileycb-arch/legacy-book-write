/**
 * In-memory and localStorage payments module.
 */

const STORAGE_KEY = 'uspk_payments_entitlements';
const listeners = new Set();

function getStoredPurchases() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading payments entitlements', e);
  }
  return [{ sku: 'uspk-pass-12mo', count: 1 }]; // Default active pass so writers can explore immediately
}

let purchases = getStoredPurchases();

function notify() {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch (e) {
      console.error('Payment listener error', e);
    }
  });
}

export const payments = {
  getEntitlements: async () => {
    return { purchases: [...purchases] };
  },

  onPayment: (cb) => {
    listeners.add(cb);
    return {
      unsubscribe: () => listeners.delete(cb),
    };
  },

  checkout: async ({ sku }) => {
    const existing = purchases.find((p) => p.sku === sku);
    if (existing) {
      existing.count = (existing.count || 0) + 1;
    } else {
      purchases.push({ sku, count: 1 });
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(purchases));
    } catch (e) {}
    notify();
    return { success: true };
  },
};

export const _internal = {};
