'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'tp_watchlist';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setWatchlist(JSON.parse(stored));
    } catch {}
    setHydrated(true);
  }, []);

  const toggle = useCallback((coinId: string) => {
    setWatchlist(prev => {
      const next = prev.includes(coinId)
        ? prev.filter(id => id !== coinId)
        : [...prev, coinId];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const isWatched = useCallback((coinId: string) => watchlist.includes(coinId), [watchlist]);

  return { watchlist, toggle, isWatched, hydrated };
}
