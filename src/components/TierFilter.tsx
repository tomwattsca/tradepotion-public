'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, formatMarketCap, formatPct, pctColor } from '@/lib/utils';

interface Coin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
}

interface Props {
  coins: Coin[];
  filterStables?: boolean;
}

const TIERS = [
  { label: 'All', min: 0, max: Infinity },
  { label: 'Large Cap', sublabel: '>$10B', min: 10_000_000_000, max: Infinity },
  { label: 'Mid Cap', sublabel: '$1B–$10B', min: 1_000_000_000, max: 10_000_000_000 },
  { label: 'Small Cap', sublabel: '$100M–$1B', min: 100_000_000, max: 1_000_000_000 },
  { label: 'Micro Cap', sublabel: '<$100M', min: 0, max: 100_000_000 },
];

export default function TierFilter({ coins, filterStables = false }: Props) {
  const [activeTier, setActiveTier] = useState(0);

  const baseCoins = useMemo(() => {
    if (!filterStables) return coins;
    // Filter stablecoins: price between $0.95-$1.05 AND abs(24h change) < 0.5%
    return coins.filter(c => !(c.current_price >= 0.95 && c.current_price <= 1.05 && Math.abs(c.price_change_percentage_24h) < 0.5));
  }, [coins, filterStables]);

  const filtered = useMemo(() => {
    const tier = TIERS[activeTier];
    return baseCoins.filter(c => c.market_cap >= tier.min && c.market_cap < tier.max);
  }, [baseCoins, activeTier]);

  return (
    <>
      {/* Tier tabs */}
      <div className="flex gap-2 flex-wrap mb-4">
        {TIERS.map((tier, i) => (
          <button
            key={tier.label}
            onClick={() => setActiveTier(i)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTier === i
                ? 'bg-violet-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
            }`}
          >
            {tier.label}
            {tier.sublabel && (
              <span className="ml-1 text-xs opacity-70">{tier.sublabel}</span>
            )}
          </button>
        ))}
        <span className="ml-auto text-xs text-zinc-500 self-center">{filtered.length} coins</span>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden">
        <div className="grid grid-cols-[2rem_1fr_7rem_7rem_9rem_9rem] px-4 py-2 border-b border-zinc-800 text-xs text-zinc-500">
          <span className="text-right">#</span>
          <span className="pl-3">Coin</span>
          <span className="text-right">Price</span>
          <span className="text-right">24h %</span>
          <span className="text-right hidden sm:block">Market Cap</span>
          <span className="text-right hidden md:block">Volume (24h)</span>
        </div>
        <div className="divide-y divide-zinc-800/40">
          {filtered.map((coin, i) => (
            <Link
              key={coin.id}
              href={`/coins/${coin.id}`}
              className="grid grid-cols-[2rem_1fr_7rem_7rem_9rem_9rem] items-center px-4 py-3 hover:bg-zinc-900 transition-colors group"
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
              <span className={`text-sm text-right font-semibold ${pctColor(coin.price_change_percentage_24h)}`}>
                {formatPct(coin.price_change_percentage_24h)}
              </span>
              <span className="text-sm text-right text-zinc-300 hidden sm:block">{formatMarketCap(coin.market_cap)}</span>
              <span className="text-sm text-right text-zinc-400 hidden md:block">{formatMarketCap(coin.total_volume)}</span>
            </Link>
          ))}
          {filtered.length === 0 && (
            <p className="px-4 py-8 text-sm text-zinc-500 text-center">
              No coins in this tier right now.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
