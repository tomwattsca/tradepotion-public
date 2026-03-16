'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(false);
    const params = new URLSearchParams({ minVol: String(minVol) });
    fetch(`/api/vol-spikes?${params}`)
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
  }, [minVol]);

  const filtered = useMemo(() => {
    const tier = CAP_TIERS[capTier];
    return coins.filter(c => c.market_cap >= tier.min && c.market_cap < tier.max);
  }, [coins, capTier]);

  return (
    <div>
      {/* Controls row */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
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
            <span className="ml-2 opacity-60">
              {new Date(lastUpdated).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} UTC
            </span>
          )}
        </span>
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
            <p className="px-4 py-8 text-sm text-zinc-500 text-center">
              Data temporarily unavailable — try again shortly.
            </p>
          )}
          {!loading && !error && filtered.length === 0 && (
            <p className="px-4 py-8 text-sm text-zinc-500 text-center">
              No coins match these filters right now.
            </p>
          )}
          {!loading && !error && filtered.map((coin, i) => (
            <Link
              key={coin.id}
              href={`/coins/${coin.id}`}
              className="grid grid-cols-[2rem_1fr_7rem_8rem_9rem_9rem] items-center px-4 py-3 hover:bg-zinc-900 transition-colors group"
            >
              <span className="text-xs text-zinc-500 text-right">{i + 1}</span>
              <div className="flex items-center gap-2.5 pl-3 min-w-0">
                <Image src={coin.image} alt={coin.name} width={24} height={24} className="rounded-full shrink-0" />
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

      {/* Explainer */}
      <p className="mt-3 text-xs text-zinc-600 text-center">
        Vol/MCap ratio — higher % means unusual trading volume relative to the coin&apos;s size. A signal of potential momentum or news-driven activity.
      </p>
    </div>
  );
}
