import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from './db';

export function useLive(table, options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const fetchData = useCallback(async () => {
    try {
      const opts = optionsRef.current || {};
      const rows = await db.select(table, opts.filters, opts);
      setData(rows);
      setError(null);
    } catch (err) {
      console.error(`Error in useLive for ${table}:`, err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [table]);

  useEffect(() => {
    fetchData();
    const unsub = db.subscribe(table, fetchData);
    return () => unsub();
  }, [table, fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export const useLiveShared = useLive;
