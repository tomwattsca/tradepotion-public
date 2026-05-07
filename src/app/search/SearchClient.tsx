'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ArrowLeft } from 'lucide-react';

interface SearchResult {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
  market_cap_rank: number;
}

const popularSearches = [
  { label: 'Bitcoin', href: '/search?q=bitcoin' },
  { label: 'Ethereum', href: '/search?q=ethereum' },
  { label: 'Solana', href: '/search?q=solana' },
  { label: 'Akash Network', href: '/search?q=akash' },
];

export default function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQ = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => runSearch(query), 300);
    return () => clearTimeout(t);
  }, [query, runSearch]);

  useEffect(() => {
    if (initialQ) runSearch(initialQ);
  }, []); // eslint-disable-line

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
    runSearch(query);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Markets
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-3">Search Crypto Prices</h1>
        <p className="text-sm leading-6 text-zinc-400">
          Find public Trade Potion coin pages by token name or symbol, then review live price, market cap,
          24-hour volume, categories, comparisons, and neutral market context. Search result pages are a
          utility for users and are intentionally kept out of Google&apos;s index.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 pointer-events-none" />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Bitcoin, Ethereum, Solana…"
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 pl-12 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
        />
      </form>

      {!query && (
        <section aria-labelledby="popular-searches" className="mb-8 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <h2 id="popular-searches" className="text-sm font-semibold text-zinc-200 mb-3">Popular coin searches</h2>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-zinc-800 px-3 py-1 text-sm text-zinc-300 hover:border-violet-500 hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </section>
      )}

      {loading && (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden">
          <div className="divide-y divide-zinc-800/50">
            {results.map((coin) => (
              <Link
                key={coin.id}
                href={`/coins/${coin.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-900 transition-colors"
              >
                <Image src={coin.thumb} alt={coin.name} width={28} height={28} className="h-7 w-7 rounded-full" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{coin.name}</p>
                  <p className="text-xs text-zinc-500 uppercase">{coin.symbol}</p>
                </div>
                {coin.market_cap_rank && (
                  <span className="text-xs text-zinc-500">#{coin.market_cap_rank}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <p className="text-center text-sm text-zinc-500 py-8">No coins found for &ldquo;{query}&rdquo;</p>
      )}
    </main>
  );
}
