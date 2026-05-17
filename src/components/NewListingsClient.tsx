'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, formatMarketCap, formatPct, pctColor } from '@/lib/utils';

interface NewCoin {
  id: string;
  name: string;
  symbol: string;
  image_url: string;
  current_price: number;
  market_cap: number;
  volume_24h: number;
  price_change_24h: number;
  first_seen: string;
  listing_rank: number;
}

function timeAgo(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  const diffD = Math.floor(diffH / 24);
  if (diffD > 0) return `${diffD}d ago`;
  if (diffH > 0) return `${diffH}h ago`;
  return 'Just now';
}

export default function NewListingsClient() {
  const [coins, setCoins] = useState<NewCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch('/api/new-listings?limit=50')
      .then(r => r.json())
      .then(data => {
        if (data?.coins) {
          setCoins(data.coins);
          setLastUpdated(data.generated_at ?? null);
        } else {
          setError(true);
        }
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-zinc-500">
          Coins first tracked by Trade Potion in the last 30 days — newest first.
        </p>
        {lastUpdated && !loading && (
          <span className="text-xs text-zinc-600">
            Updated {new Date(lastUpdated).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} UTC
          </span>
        )}
      </div>

      <div className="rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden">
        <div className="grid grid-cols-[2rem_1fr_7rem_7rem_9rem_9rem] px-4 py-2 border-b border-zinc-800 text-xs text-zinc-500">
          <span className="text-right">#</span>
          <span className="pl-3">Coin</span>
          <span className="text-right">Price</span>
          <span className="text-right">24h %</span>
          <span className="text-right hidden sm:block">Market Cap</span>
          <span className="text-right hidden md:block">First Tracked</span>
        </div>

        <div className="divide-y divide-zinc-800/40">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {error && (
            <p className="px-4 py-8 text-sm text-zinc-500 text-center">
              New listings data temporarily unavailable — try again shortly.
            </p>
          )}
          {!loading && !error && coins.length === 0 && (
            <div className="px-4 py-8 text-center" role="status" aria-live="polite" data-new-listings-state="empty">
              <p className="text-sm font-medium text-zinc-300">
                No newly tracked coins are available from the last 30 days right now.
              </p>
              <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
                Trade Potion keeps this page intentionally data-backed. When the new-listing feed is quiet, use the existing market movers, gainers, and search flows to research coins with current market data.
              </p>
              <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row">
                <Link
                  href="/top/trending"
                  data-event="internal_link_click"
                  data-cta-location="top_new_listings_empty_trending"
                  data-page-type="top_new_listings"
                  className="inline-flex w-full items-center justify-center rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-violet-500 hover:text-white sm:w-auto"
                >
                  View trending coins
                </Link>
                <Link
                  href="/top/gainers"
                  data-event="internal_link_click"
                  data-cta-location="top_new_listings_empty_gainers"
                  data-page-type="top_new_listings"
                  className="inline-flex w-full items-center justify-center rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-violet-500 hover:text-white sm:w-auto"
                >
                  Check top gainers
                </Link>
                <Link
                  href="/search"
                  data-event="internal_link_click"
                  data-cta-location="top_new_listings_empty_search"
                  data-page-type="top_new_listings"
                  className="inline-flex w-full items-center justify-center rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-violet-500 hover:text-white sm:w-auto"
                >
                  Search tracked markets
                </Link>
              </div>
            </div>
          )}
          {!loading && !error && coins.map((coin) => (
            <Link
              key={coin.id}
              href={`/coins/${coin.id}`}
              data-event="internal_link_click"
              data-cta-location="top_new_listings_coin"
              data-coin-id={coin.id}
              data-coin-symbol={coin.symbol}
              className="grid grid-cols-[2rem_1fr_7rem_7rem_9rem_9rem] items-center px-4 py-3 hover:bg-zinc-900 transition-colors group"
            >
              <span className="text-xs text-zinc-500 text-right">{coin.listing_rank}</span>
              <div className="flex items-center gap-2.5 pl-3 min-w-0">
                <Image src={coin.image_url} alt={coin.name} width={24} height={24} className="rounded-full shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-white truncate group-hover:text-violet-300 transition-colors">{coin.name}</p>
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-medium hidden sm:inline">NEW</span>
                  </div>
                  <p className="text-xs text-zinc-500 uppercase">{coin.symbol}</p>
                </div>
              </div>
              <span className="text-sm text-right text-white">{formatPrice(coin.current_price)}</span>
              <span className={`text-sm text-right ${pctColor(coin.price_change_24h)}`}>
                {formatPct(coin.price_change_24h)}
              </span>
              <span className="text-sm text-right text-zinc-300 hidden sm:block">
                {formatMarketCap(coin.market_cap)}
              </span>
              <span className="text-sm text-right text-zinc-500 hidden md:block text-xs">
                {timeAgo(coin.first_seen)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
