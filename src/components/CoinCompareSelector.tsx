'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

interface SearchResult {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
  market_cap_rank: number;
}

interface CoinInputProps {
  label: string;
  value: string; // coin id
  displayName: string;
  onChange: (id: string, name: string) => void;
}

function CoinInput({ label, value, displayName, onChange }: CoinInputProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const search = useCallback((q: string) => {
    if (!q.trim()) { setResults([]); setOpen(false); return; }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then((data: SearchResult[]) => {
        setResults(data.slice(0, 8));
        setOpen(true);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, []);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 250);
  }

  function select(coin: SearchResult) {
    onChange(coin.id, coin.name);
    setQuery('');
    setResults([]);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      <label className="block text-xs text-zinc-500 mb-1 font-medium">{label}</label>

      {/* Current selection pill */}
      {value && (
        <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-zinc-800 rounded-lg border border-zinc-700 text-sm text-white">
          <span className="font-medium truncate">{displayName}</span>
          <span className="text-zinc-500 text-xs ml-auto">{value}</span>
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => query && search(query)}
          placeholder={value ? `Change ${label.toLowerCase()}…` : `Search ${label.toLowerCase()}…`}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border border-violet-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden">
          {results.map(coin => (
            <li key={coin.id}>
              <button
                type="button"
                onClick={() => select(coin)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-800 transition-colors text-left"
              >
                {coin.thumb ? (
                  <Image src={coin.thumb} alt={coin.name} width={24} height={24} className="rounded-full shrink-0" unoptimized />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-zinc-700 shrink-0" />
                )}
                <span className="text-sm text-white font-medium truncate">{coin.name}</span>
                <span className="text-xs text-zinc-500 ml-auto shrink-0">{coin.symbol.toUpperCase()}</span>
                {coin.market_cap_rank && (
                  <span className="text-xs text-zinc-600 shrink-0">#{coin.market_cap_rank}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface CoinCompareSelectorProps {
  currentPair: string; // e.g. "bitcoin-vs-ethereum"
}

export default function CoinCompareSelector({ currentPair }: CoinCompareSelectorProps) {
  const router = useRouter();
  const match = currentPair.match(/^(.+)-vs-(.+)$/);
  const [coinA, setCoinA] = useState(match?.[1] ?? '');
  const [coinAName, setCoinAName] = useState(match?.[1] ? match[1].charAt(0).toUpperCase() + match[1].slice(1) : '');
  const [coinB, setCoinB] = useState(match?.[2] ?? '');
  const [coinBName, setCoinBName] = useState(match?.[2] ? match[2].charAt(0).toUpperCase() + match[2].slice(1) : '');

  const canCompare = coinA && coinB && coinA !== coinB;
  const newPair = `${coinA}-vs-${coinB}`;
  const alreadyShowing = newPair === currentPair;

  function handleCompare() {
    if (!canCompare || alreadyShowing) return;
    router.push(`/compare/${newPair}`);
  }

  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 mb-6">
      <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide mb-3">Compare any two coins</p>
      <div className="flex flex-col sm:flex-row gap-3 items-end">
        <CoinInput
          label="Coin A"
          value={coinA}
          displayName={coinAName}
          onChange={(id, name) => { setCoinA(id); setCoinAName(name); }}
        />
        <span className="text-zinc-600 font-bold text-sm sm:pb-2 sm:pt-6 shrink-0">VS</span>
        <CoinInput
          label="Coin B"
          value={coinB}
          displayName={coinBName}
          onChange={(id, name) => { setCoinB(id); setCoinBName(name); }}
        />
        <button
          type="button"
          onClick={handleCompare}
          disabled={!canCompare || alreadyShowing}
          title={alreadyShowing ? 'Currently comparing this pair' : 'Compare these two coins'}
          className="sm:pb-0 w-full sm:w-auto shrink-0 px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
        >
          {alreadyShowing ? '✓ Viewing this pair' : 'Compare →'}
        </button>
      </div>
    </div>
  );
}
