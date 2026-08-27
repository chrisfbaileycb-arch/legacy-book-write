/**
 * Client-side lightweight reactive DB with localStorage persistence.
 */

const STORAGE_PREFIX = 'uspk_db_';
const tableListeners = new Map();

function getTableData(table) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + table);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading table ' + table, e);
  }
  return [];
}

function setTableData(table, items) {
  try {
    localStorage.setItem(STORAGE_PREFIX + table, JSON.stringify(items));
  } catch (e) {
    console.error('Error writing table ' + table, e);
  }
  notify(table);
}

function notify(table) {
  const cbs = tableListeners.get(table);
  if (cbs) {
    cbs.forEach((cb) => {
      try {
        cb();
      } catch (e) {
        console.error('DB listener error', e);
      }
    });
  }
}

export const db = {
  subscribe(table, cb) {
    if (!tableListeners.has(table)) {
      tableListeners.set(table, new Set());
    }
    tableListeners.get(table).add(cb);
    return () => {
      const cbs = tableListeners.get(table);
      if (cbs) cbs.delete(cb);
    };
  },

  async select(table, filters = {}, options = {}) {
    let items = getTableData(table);

    // Apply filters
    if (filters && typeof filters === 'object') {
      items = items.filter((item) => {
        return Object.entries(filters).every(([k, v]) => item[k] === v);
      });
    }

    // Apply ordering (e.g. '-createdAt' or 'createdAt')
    if (options.order) {
      const desc = options.order.startsWith('-');
      const field = desc ? options.order.slice(1) : options.order;
      items.sort((a, b) => {
        const valA = a[field] ?? '';
        const valB = b[field] ?? '';
        if (valA < valB) return desc ? 1 : -1;
        if (valA > valB) return desc ? -1 : 1;
        return 0;
      });
    }

    // Apply limit
    if (options.limit && typeof options.limit === 'number') {
      items = items.slice(0, options.limit);
    }

    return items;
  },

  async insert(table, data) {
    const items = getTableData(table);
    const id = data.id || 'id_' + Math.random().toString(36).slice(2, 11) + '_' + Date.now();
    const row = {
      ...data,
      id,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    items.unshift(row);
    setTableData(table, items);
    return row;
  },

  async upsert(table, data, key) {
    const items = getTableData(table);
    const matchId = key || data.id;
    const index = items.findIndex((item) => (matchId ? item.id === matchId : false));

    const row = {
      ...(index >= 0 ? items[index] : {}),
      ...data,
      id: matchId || 'id_' + Math.random().toString(36).slice(2, 11) + '_' + Date.now(),
      updatedAt: new Date().toISOString(),
      createdAt: index >= 0 ? items[index].createdAt : new Date().toISOString(),
    };

    if (index >= 0) {
      items[index] = row;
    } else {
      items.unshift(row);
    }

    setTableData(table, items);
    return row;
  },

  async update(table, id, data) {
    const items = getTableData(table);
    const index = items.findIndex((item) => item.id === id);
    if (index >= 0) {
      items[index] = {
        ...items[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      setTableData(table, items);
      return items[index];
    }
    return null;
  },

  async delete(table, id) {
    const items = getTableData(table);
    const filtered = items.filter((item) => item.id !== id);
    setTableData(table, filtered);
    return true;
  },
};
