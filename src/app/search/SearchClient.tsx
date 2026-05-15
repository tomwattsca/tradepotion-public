'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';

interface SearchResult {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
  market_cap_rank: number;
}

const popularSearches = [
  { label: 'Bitcoin', href: '/search?q=bitcoin', location: 'search_popular_bitcoin' },
  { label: 'Ethereum', href: '/search?q=ethereum', location: 'search_popular_ethereum' },
  { label: 'Solana', href: '/search?q=solana', location: 'search_popular_solana' },
  { label: 'Akash Network', href: '/search?q=akash', location: 'search_popular_akash' },
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
    <>
      <form onSubmit={handleSubmit} className="relative mb-6">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Bitcoin, Ethereum, Solana…"
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 pl-12 pr-4 text-white placeholder-zinc-500 transition-colors focus:border-violet-500 focus:outline-none"
          aria-label="Search cryptocurrency prices by name or symbol"
        />
      </form>

      {!query && (
        <section aria-labelledby="popular-searches" className="mb-8 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <h2 id="popular-searches" className="mb-3 text-sm font-semibold text-zinc-200">Popular coin searches</h2>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-zinc-800 px-3 py-1 text-sm text-zinc-300 transition-colors hover:border-violet-500 hover:text-white"
                data-event="internal_link_click"
                data-cta-location={item.location}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-zinc-500">
            Search remains a noindexed utility, but these links help users jump into existing coin pages and make
            same-site research journeys measurable without sending query text to analytics.
          </p>
        </section>
      )}

      {loading && (
        <div className="flex justify-center py-8" role="status" aria-label="Loading search results">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
          <div className="divide-y divide-zinc-800/50">
            {results.map((coin) => (
              <Link
                key={coin.id}
                href={`/coins/${coin.id}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-zinc-900"
                data-event="internal_link_click"
                data-cta-location="search_result_coin"
                data-coin-id={coin.id}
                data-coin-symbol={coin.symbol.toUpperCase()}
              >
                <Image src={coin.thumb} alt={coin.name} width={28} height={28} className="h-7 w-7 rounded-full" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{coin.name}</p>
                  <p className="text-xs uppercase text-zinc-500">{coin.symbol}</p>
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
        <p className="py-8 text-center text-sm text-zinc-500">No coins found for &ldquo;{query}&rdquo;</p>
      )}
    </>
  );
}
