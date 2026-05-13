'use client';

import { useEffect, useState } from 'react';
import { useWatchlist } from '@/hooks/useWatchlist';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Star, ArrowLeft, Bell } from 'lucide-react';
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

export default function WatchlistClient() {
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

      <section className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-3">
            <Star className="mt-1 h-6 w-6 shrink-0 text-amber-400 fill-amber-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Crypto Watchlist</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
                Save coins in this browser for repeat market checks, then jump back to live price,
                volume, market cap, and alert workflows. Watchlist data stays local to your device.
              </p>
            </div>
          </div>
          {coins.length > 0 && (
            <span className="rounded-full border border-zinc-700 px-3 py-1 text-sm text-zinc-300">{coins.length} coin{coins.length !== 1 ? 's' : ''}</span>
          )}
        </div>
        <div className="mt-4 grid gap-3 text-sm text-zinc-400 md:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
            <strong className="block text-zinc-200">1. Star coins</strong>
            Use the star beside any market row or coin page to save it here.
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
            <strong className="block text-zinc-200">2. Recheck live data</strong>
            Compare 24h and 7d movement without treating the list as a recommendation.
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
            <strong className="block text-zinc-200">3. Add alerts carefully</strong>
            Use price alerts as monitoring prompts, not investment advice.
          </div>
        </div>
      </section>

      {!hydrated && (
        <div className="flex justify-center py-16">
          <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {hydrated && watchlist.length === 0 && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">
          <Star className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-200 text-lg font-semibold mb-2">Your watchlist is empty</p>
          <p className="mx-auto mb-6 max-w-xl text-sm leading-6 text-zinc-500">
            Start with a coin search or the live market table. Starred coins are saved in local
            browser storage, so this utility is intentionally noindexed and not part of the public sitemap.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/search" className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500">
              <Search className="h-4 w-4" /> Search coins
            </Link>
            <Link
              href="/"
              data-event="price_alert_click"
              data-cta-location="watchlist_empty"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-violet-500 hover:text-white"
            >
              <Bell className="h-4 w-4" /> Set a price alert
            </Link>
          </div>
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
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">
          <div className="min-w-[760px]">
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
        </div>
      )}
    </main>
  );
}
