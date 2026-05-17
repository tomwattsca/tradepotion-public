'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, formatPct, pctColor } from '@/lib/utils';

interface TrendingCoin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  rank: number;
  trending_rank: number;
  price_usd: number | null;
  pct_24h: number | null;
  market_cap: string | null;
  total_volume: string | null;
}

export default function TrendingClient() {
  const [coins, setCoins] = useState<TrendingCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch('/api/trending')
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
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-zinc-500">
          Top coins trending on CoinGecko right now — based on search volume and community interest.
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
              Trending data temporarily unavailable — try again shortly.
            </p>
          )}
          {!loading && !error && coins.map((coin) => (
            <Link
              key={coin.id}
              href={`/coins/${coin.id}`}
              data-event="internal_link_click"
              data-cta-location="top_trending_coin"
              data-coin-id={coin.id}
              data-coin-symbol={coin.symbol}
              className="grid grid-cols-[2rem_1fr_7rem_7rem_9rem_9rem] items-center px-4 py-3 hover:bg-zinc-900 transition-colors group"
            >
              <span className="text-xs font-bold text-amber-400 text-right">{coin.trending_rank}</span>
              <div className="flex items-center gap-2.5 pl-3 min-w-0">
                <Image src={coin.image} alt={coin.name} width={24} height={24} className="rounded-full shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate group-hover:text-violet-300 transition-colors">{coin.name}</p>
                  <p className="text-xs text-zinc-500 uppercase">{coin.symbol}</p>
                </div>
                {coin.rank && (
                  <span className="hidden lg:inline text-xs text-zinc-600 ml-1">#{coin.rank}</span>
                )}
              </div>
              <span className="text-sm text-right text-white">
                {coin.price_usd != null ? formatPrice(coin.price_usd) : '—'}
              </span>
              <span className={`text-sm text-right ${coin.pct_24h != null ? pctColor(coin.pct_24h) : 'text-zinc-500'}`}>
                {coin.pct_24h != null ? formatPct(coin.pct_24h) : '—'}
              </span>
              <span className="text-sm text-right text-zinc-300 hidden sm:block">
                {coin.market_cap ? coin.market_cap : '—'}
              </span>
              <span className="text-sm text-right text-zinc-400 hidden md:block">
                {coin.total_volume ? coin.total_volume : '—'}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
