'use client';

import { useEffect, useState } from 'react';
import { useWatchlist } from '@/hooks/useWatchlist';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ArrowLeft } from 'lucide-react';
import { formatPrice, formatMarketCap, formatPct, pctColor } from '@/lib/utils';
import Sparkline from '@/components/Sparkline';
import WatchlistStar from '@/components/WatchlistStar';

interface Coin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  market_cap: number;
  total_volume: number;
  market_cap_rank: number;
  sparkline_in_7d?: { price: number[] };
}

export default function WatchlistPage() {
  const { watchlist, hydrated } = useWatchlist();
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!hydrated || watchlist.length === 0) { setCoins([]); return; }
    setLoading(true);
    setError(false);
    fetch(`/api/coins/batch?ids=${watchlist.join(',')}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: Coin[]) => { setCoins(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [watchlist, hydrated]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Markets
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
        <h1 className="text-2xl font-bold text-white">Watchlist</h1>
        {coins.length > 0 && (
          <span className="text-sm text-zinc-500">{coins.length} coin{coins.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {!hydrated && (
        <div className="flex justify-center py-16">
          <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {hydrated && watchlist.length === 0 && (
        <div className="text-center py-20">
          <Star className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400 text-lg font-medium mb-2">Your watchlist is empty</p>
          <p className="text-zinc-600 text-sm mb-6">Star any coin to track it here</p>
          <Link href="/" className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors">
            Browse coins
          </Link>
        </div>
      )}

      {hydrated && watchlist.length > 0 && loading && (
        <div className="flex justify-center py-16">
          <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <p className="text-sm text-zinc-500 text-center py-8">Failed to load watchlist data — try again shortly.</p>
      )}

      {!loading && !error && coins.length > 0 && (
        <div className="rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1.5rem_1fr_7rem_5rem_6rem_6rem_8rem_1.5rem] px-4 py-2 border-b border-zinc-800 text-xs text-zinc-500">
            <span />
            <span className="pl-3">Coin</span>
            <span className="text-right">Price</span>
            <span className="text-right text-zinc-600">7D</span>
            <span className="text-right">24h %</span>
            <span className="text-right">7d %</span>
            <span className="text-right">Market Cap</span>
            <span />
          </div>
          <div className="divide-y divide-zinc-800/40">
            {coins.map((coin) => {
              const pct7d = coin.price_change_percentage_7d_in_currency ?? null;
              return (
                <Link
                  key={coin.id}
                  href={`/coins/${coin.id}`}
                  className="grid grid-cols-[1.5rem_1fr_7rem_5rem_6rem_6rem_8rem_1.5rem] items-center px-4 py-3 hover:bg-zinc-900 transition-colors group"
                >
                  <span className="text-xs text-zinc-600 text-right">{coin.market_cap_rank}</span>
                  <div className="flex items-center gap-2.5 pl-3 min-w-0">
                    <Image src={coin.image} alt={coin.name} width={24} height={24} className="rounded-full shrink-0" unoptimized />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate group-hover:text-violet-300 transition-colors">{coin.name}</p>
                      <p className="text-xs text-zinc-500 uppercase">{coin.symbol}</p>
                    </div>
                  </div>
                  <span className="text-sm text-right text-white">{formatPrice(coin.current_price)}</span>
                  <div className="flex justify-end pr-1">
                    <Sparkline prices={coin.sparkline_in_7d?.price ?? []} width={52} height={28} />
                  </div>
                  <span className={`text-sm text-right font-medium ${pctColor(coin.price_change_percentage_24h)}`}>
                    {formatPct(coin.price_change_percentage_24h)}
                  </span>
                  <span className={`text-sm text-right font-medium ${pct7d != null ? pctColor(pct7d) : 'text-zinc-500'}`}>
                    {pct7d != null ? formatPct(pct7d) : '—'}
                  </span>
                  <span className="text-sm text-right text-zinc-300">{formatMarketCap(coin.market_cap)}</span>
                  <div className="flex justify-center">
                    <WatchlistStar coinId={coin.id} coinName={coin.name} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
