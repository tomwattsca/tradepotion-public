'use client';
import FreshnessBar from '@/components/FreshnessBar';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import CoinImage from '@/components/CoinImage';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatPrice, formatMarketCap, formatPct, pctColor } from '@/lib/utils';
import Sparkline from '@/components/Sparkline';
import TableSkeleton from '@/components/TableSkeleton';

interface Coin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  pct: number;
  sparkline_in_7d?: { price: number[] };
}

type Range = '1h' | '24h' | '7d';
type Mode = 'gainers' | 'losers';

const PAGE_SIZE = 50;

const RANGES: { label: string; value: Range }[] = [
  { label: '1H', value: '1h' },
  { label: '24H', value: '24h' },
  { label: '7D', value: '7d' },
];

const VOL_FILTERS: { label: string; value: number }[] = [
  { label: 'All Vol', value: 0 },
  { label: '>$1M', value: 1_000_000 },
  { label: '>$10M', value: 10_000_000 },
  { label: '>$100M', value: 100_000_000 },
];

const CAP_TIERS = [
  { label: 'All', min: 0, max: Infinity },
  { label: 'Large', sublabel: '>$10B', min: 10_000_000_000, max: Infinity },
  { label: 'Mid', sublabel: '$1B–$10B', min: 1_000_000_000, max: 10_000_000_000 },
  { label: 'Small', sublabel: '$100M–$1B', min: 100_000_000, max: 1_000_000_000 },
  { label: 'Micro', sublabel: '<$100M', min: 0, max: 100_000_000 },
];

interface Props {
  mode: Mode;
}

export default function GainersClient({ mode }: Props) {
  const [range, setRange] = useState<Range>('24h');
  const [minVol, setMinVol] = useState(0);
  const [capTier, setCapTier] = useState(0);
  const [page, setPage] = useState(0);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [staleCoins, setStaleCoins] = useState<Coin[]>([]); // last good data for graceful degradation
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Reset to page 0 whenever filters change
  useEffect(() => { setPage(0); }, [range, minVol, capTier]);

  const fetchGainers = useCallback(async (retries = 3) => {
    setLoading(true);
    setError(false);
    setIsStale(false);
    const params = new URLSearchParams({ range, type: mode, minVol: String(minVol), limit: '250' });
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(`/api/gainers?${params}`);
        const data = await res.json();
        if (data?.coins?.length > 0) {
          setCoins(data.coins);
          setStaleCoins(data.coins); // save as stale fallback
          setLastUpdated(data.fetchedAt ? String(data.fetchedAt) : (data.generated_at ?? null));
          setLoading(false);
          return;
        }
        if (attempt < retries) await new Promise(r => setTimeout(r, 600 * Math.pow(2, attempt)));
      } catch {
        if (attempt < retries) await new Promise(r => setTimeout(r, 600 * Math.pow(2, attempt)));
      }
    }
    // All retries failed — use stale data if available
    if (staleCoins.length > 0) {
      setCoins(staleCoins);
      setIsStale(true);
      setLoading(false);
    } else {
      setError(true);
      setLoading(false);
    }
  }, [range, minVol, mode, staleCoins]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchGainers(); }, [range, minVol, mode]);

  const filtered = useMemo(() => {
    const tier = CAP_TIERS[capTier];
    return coins.filter(c => c.market_cap >= tier.min && c.market_cap < tier.max);
  }, [coins, capTier]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageCoins = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const accentColor = mode === 'gainers' ? 'text-emerald-400' : 'text-red-400';

  return (
    <div>
      {/* Controls row */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4 items-end">
        {/* Timeframe */}
        <div className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Timeframe</span>
          <div className="flex gap-1 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
            {RANGES.map(r => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                  range === r.value ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Min Volume */}
        <div className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Min Volume</span>
          <div className="flex gap-1 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
            {VOL_FILTERS.map(v => (
              <button
                key={v.value}
                onClick={() => setMinVol(v.value)}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                  minVol === v.value ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Market Cap */}
        <div className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Market Cap</span>
          <div className="flex gap-1 flex-wrap">
            {CAP_TIERS.map((t, i) => (
              <button
                key={t.label}
                onClick={() => setCapTier(i)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  capTier === i ? 'bg-violet-600 text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {t.label}
                {t.sublabel && <span className="ml-1 opacity-60">{t.sublabel}</span>}
              </button>
            ))}
          </div>
        </div>

        <span className="ml-auto text-xs text-zinc-600">
          {loading ? 'Loading…' : `${filtered.length} coins`}
          {lastUpdated && !loading && (
            <span className="ml-2"><FreshnessBar fetchedAt={Number(lastUpdated)} /></span>
          )}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden">
        <div className="grid grid-cols-[2rem_1fr_7rem_7rem_9rem_9rem] px-4 py-2 border-b border-zinc-800 text-xs text-zinc-500">
          <span className="text-right">#</span>
          <span className="pl-3">Coin</span>
          <span className="text-right">Price</span>
          <span className="text-right text-zinc-600 text-xs">7D</span>
          <span className={`text-right ${accentColor}`}>
            {range === '1h' ? '1H %' : range === '7d' ? '7D %' : '24H %'}
          </span>
          <span className="text-right hidden sm:block">Market Cap</span>
          <span className="text-right hidden md:block">Volume (24h)</span>
        </div>
        <div className="divide-y divide-zinc-800/40">
          {loading && <TableSkeleton rows={10} cols={6} />}
          {isStale && (
            <div className="flex items-center justify-between px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-400">
              <span>⚠ Showing cached data — live data temporarily unavailable</span>
              <button onClick={() => fetchGainers()} className="underline hover:no-underline">Retry</button>
            </div>
          )}
          {error && (
            <div className="px-4 py-10 text-center">
              <p className="text-sm text-zinc-400 mb-3">Data temporarily unavailable.</p>
              <button
                onClick={() => fetchGainers()}
                className="px-4 py-2 text-sm bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <p className="px-4 py-8 text-sm text-zinc-500 text-center">
              No coins in this filter right now.
            </p>
          )}
          {!loading && !error && pageCoins.map((coin, i) => (
            <Link
              key={coin.id}
              href={`/coins/${coin.id}`}
              className="grid grid-cols-[2rem_1fr_7rem_5rem_7rem_9rem_9rem] items-center px-4 py-3 hover:bg-zinc-900 transition-colors group"
            >
              <span className="text-xs text-zinc-500 text-right">{page * PAGE_SIZE + i + 1}</span>
              <div className="flex items-center gap-2.5 pl-3 min-w-0">
                <CoinImage src={coin.image} alt={coin.name} name={coin.name} symbol={coin.symbol} width={24} height={24} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-violet-200 truncate group-hover:text-violet-300 group-hover:underline transition-colors">{coin.name}</p>
                  <p className="text-xs text-zinc-500 uppercase">{coin.symbol}</p>
                </div>
              </div>
              <span className="text-sm text-right text-white">{formatPrice(coin.current_price)}</span>
              <div className="flex justify-end pr-1">
                <Sparkline prices={coin.sparkline_in_7d?.price ?? []} width={52} height={28} />
              </div>
              <span className={`text-sm text-right font-semibold ${pctColor(coin.pct)}`}>
                {formatPct(coin.pct)}
              </span>
              <span className="text-sm text-right text-zinc-300 hidden sm:block">{formatMarketCap(coin.market_cap)}</span>
              <span className="text-sm text-right text-zinc-400 hidden md:block">{formatMarketCap(coin.total_volume)}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Prev
          </button>
          <span className="text-xs text-zinc-500">
            Page {page + 1} of {totalPages} — showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
