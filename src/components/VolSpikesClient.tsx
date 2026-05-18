'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatPrice, formatMarketCap, formatPct, pctColor } from '@/lib/utils';

interface Coin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  vol_mcap_ratio: number;
  pct: number;
}

const PAGE_SIZE = 50;

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

export default function VolSpikesClient() {
  const [minVol, setMinVol] = useState(1_000_000);
  const [capTier, setCapTier] = useState(0);
  const [page, setPage] = useState(0);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string | null>(null);

  // Reset page on filter change
  useEffect(() => { setPage(0); }, [minVol, capTier]);

  useEffect(() => {
    setLoading(true);
    setError(false);
    const params = new URLSearchParams({ minVol: String(minVol) });
    fetch(`/api/vol-spikes?${params}`)
      .then(r => {
        if (!r.ok) throw new Error(`Volume spikes API returned ${r.status}`);
        return r.json();
      })
      .then(data => {
        if (data?.coins) {
          setCoins(data.coins);
          setLastUpdated(data.generated_at ?? null);
          setDataSource(data.source ?? null);
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
  }, [minVol, retryKey]);

  const filtered = useMemo(() => {
    const tier = CAP_TIERS[capTier];
    return coins.filter(c => c.market_cap >= tier.min && c.market_cap < tier.max);
  }, [coins, capTier]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageCoins = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const state = error ? 'error' : loading ? 'loading' : filtered.length === 0 ? 'empty' : 'ready';

  return (
    <div data-vol-spikes-state={state}>
      {/* Controls row */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-3 mb-4">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
          <span className="font-medium text-zinc-200">Research filters</span>
          <span>Volume spike = 24h volume relative to market cap, not a buy signal.</span>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          {/* Volume filter */}
          <div className="flex flex-wrap items-center gap-2" aria-label="Minimum 24h volume filter">
            <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">24h volume</span>
            <div className="flex gap-1 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
              {VOL_FILTERS.map(v => (
                <button
                  key={v.value}
                  onClick={() => setMinVol(v.value)}
                  data-event="filter_change"
                  data-filter-name="min_volume"
                  data-filter-action="select"
                  data-filter-value={String(v.value)}
                  data-cta-location="top_vol_spikes_filter"
                  data-page-type="top_vol_spikes"
                  className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                    minVol === v.value ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cap tier */}
          <div className="flex flex-wrap items-center gap-2" aria-label="Market cap tier filter">
            <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Market cap</span>
            <div className="flex gap-1 flex-wrap">
              {CAP_TIERS.map((t, i) => (
                <button
                  key={t.label}
                  onClick={() => setCapTier(i)}
                  data-event="filter_change"
                  data-filter-name="market_cap_tier"
                  data-filter-action="select"
                  data-filter-value={t.label.toLowerCase()}
                  data-cta-location="top_vol_spikes_filter"
                  data-page-type="top_vol_spikes"
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                    capTier === i ? 'bg-zinc-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {t.label}
                  {t.sublabel && <span className="ml-1 opacity-60">{t.sublabel}</span>}
                </button>
              ))}
            </div>
          </div>

          <span className="ml-auto text-xs text-zinc-500">
            {loading ? 'Loading…' : error ? 'Snapshot unavailable' : `${filtered.length} coins`}
            {lastUpdated && !loading && !error && (
              <span className="ml-2 opacity-70">
                {dataSource === 'cached-db' ? 'cached snapshot' : 'snapshot'} · {new Date(lastUpdated).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} UTC
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden">
        <div className="grid grid-cols-[2rem_1fr_7rem_8rem_9rem_9rem] px-4 py-2 border-b border-zinc-800 text-xs text-zinc-500">
          <span className="text-right">#</span>
          <span className="pl-3">Coin</span>
          <span className="text-right">Price</span>
          <span className="text-right text-violet-400">Vol/MCap</span>
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
            <div className="px-4 py-10 text-center" data-vol-spikes-error-state>
              <p className="text-sm font-medium text-zinc-100">Volume spike snapshot could not load.</p>
              <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-500">This page depends on recent public market-data snapshots. Try reloading the snapshot, or use the other top-list views while the volume-spike feed catches up.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setRetryKey(k => k + 1)}
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-400"
                >
                  Reload snapshot
                </button>
                <Link
                  href="/top/trending"
                  data-event="internal_link_click"
                  data-cta-location="top_vol_spikes_error_trending"
                  data-page-type="top_vol_spikes"
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:border-zinc-500 hover:text-white"
                >
                  View trending coins
                </Link>
                <Link
                  href="/search"
                  data-event="internal_link_click"
                  data-cta-location="top_vol_spikes_error_search"
                  data-page-type="top_vol_spikes"
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:border-zinc-500 hover:text-white"
                >
                  Search coins
                </Link>
              </div>
            </div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div className="px-4 py-10 text-center" data-vol-spikes-empty-state>
              <p className="text-sm font-medium text-zinc-100">No volume-spike rows match these filters.</p>
              <p className="mx-auto mt-2 max-w-lg text-sm text-zinc-500">Loosen the 24h volume or market-cap filter to inspect the latest available tracked market snapshot.</p>
              <button
                type="button"
                onClick={() => { setMinVol(0); setCapTier(0); }}
                data-event="filter_clear"
                data-filter-name="top_vol_spikes_filters"
                data-filter-action="clear"
                data-cta-location="top_vol_spikes_empty_clear"
                data-page-type="top_vol_spikes"
                className="mt-4 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:border-zinc-500 hover:text-white"
              >
                Clear filters
              </button>
            </div>
          )}
          {!loading && !error && pageCoins.map((coin, i) => (
            <Link
              key={coin.id}
              href={`/coins/${coin.id}`}
              data-event="internal_link_click"
              data-cta-location="top_vol_spikes_coin"
              data-coin-id={coin.id}
              data-coin-symbol={coin.symbol}
              data-page-type="top_vol_spikes"
              className="grid grid-cols-[2rem_1fr_7rem_8rem_9rem_9rem] items-center px-4 py-3 hover:bg-zinc-900 transition-colors group"
            >
              <span className="text-xs text-zinc-500 text-right">{page * PAGE_SIZE + i + 1}</span>
              <div className="flex items-center gap-2.5 pl-3 min-w-0">
                <Image src={coin.image} alt={coin.name} width={24} height={24} className="rounded-full shrink-0 bg-zinc-900" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate group-hover:text-violet-300 transition-colors">{coin.name}</p>
                  <p className="text-xs text-zinc-500 uppercase">{coin.symbol}</p>
                </div>
              </div>
              <span className="text-sm text-right text-white">{formatPrice(coin.current_price)}</span>
              <div className="text-right">
                <span className="text-sm font-semibold text-violet-400">
                  {(coin.vol_mcap_ratio * 100).toFixed(1)}%
                </span>
                <span className={`block text-xs ${pctColor(coin.pct)}`}>
                  {formatPct(coin.pct)} 24h
                </span>
              </div>
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

      {/* Explainer */}
      <p className="mt-3 text-xs text-zinc-600 text-center">
        Vol/MCap ratio — higher % means unusual trading volume relative to the coin&apos;s size. Use it as a neutral research queue for news, liquidity, or listing checks.
      </p>
    </div>
  );
}
