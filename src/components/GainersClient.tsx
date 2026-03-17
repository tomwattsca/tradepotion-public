'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import CoinImage from '@/components/CoinImage';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatPrice, formatMarketCap, formatPct, pctColor } from '@/lib/utils';
import Sparkline from '@/components/Sparkline';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Reset to page 0 whenever filters change
  useEffect(() => { setPage(0); }, [range, minVol, capTier]);

  useEffect(() => {
    setLoading(true);
    setError(false);
    // Request full set (limit=250) — client handles pagination
    const params = new URLSearchParams({ range, type: mode, minVol: String(minVol), limit: '250' });
    fetch(`/api/gainers?${params}`)
      .then(r => r.json())
      .then(data => {
        if (data?.coins) {
          setCoins(data.coins);
          setLastUpdated(data.generated_at ?? null);
          setLoading(false);
        } else {
          setError(true);
          setLoading(false);
        }
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [range, minVol, mode]);

  const filtered = useMemo(() => {
    const tier = CAP_TIERS[capTier];
    return coins.filter(c => c.market_cap >= tier.min && c.market_cap < tier.max);
  }, [coins, capTier]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageCoins = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const accentColor = mode === 'gainers' ? 'text-emerald-400' : 'text-red-400';
  const activeClass = mode === 'gainers' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white';

  return (
    <div>
      {/* Controls row */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        {/* Time range */}
        <div className="flex gap-1 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
          {RANGES.map(r => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                range === r.value ? activeClass : 'text-zinc-400 hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Volume filter */}
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

        {/* Cap tier */}
        <div className="flex gap-1 flex-wrap">
          {CAP_TIERS.map((t, i) => (
            <button
              key={t.label}
              onClick={() => setCapTier(i)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                capTier === i ? 'bg-zinc-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {t.label}
              {t.sublabel && <span className="ml-1 opacity-60">{t.sublabel}</span>}
            </button>
          ))}
        </div>

        <span className="ml-auto text-xs text-zinc-600">
          {loading ? 'Loading…' : `${filtered.length} coins`}
          {lastUpdated && !loading && (
            <span className="ml-2 opacity-60">{new Date(lastUpdated).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} UTC</span>
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
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {error && (
            <p className="px-4 py-8 text-sm text-zinc-500 text-center">
              Data temporarily unavailable — try again shortly.
            </p>
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
                  <p className="text-sm font-medium text-white truncate group-hover:text-violet-300 transition-colors">{coin.name}</p>
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
