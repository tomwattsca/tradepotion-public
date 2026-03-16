import { getTopGainers } from '@/lib/coingecko';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { Metadata } from 'next';
import { formatPrice, formatMarketCap, formatPct, pctColor } from '@/lib/utils';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Top Crypto Gainers Today | 24h Best Performing Coins',
  description: 'Live list of the top cryptocurrency gainers in the last 24 hours. See which altcoins are pumping right now on Trade Potion.',
};

export default async function TopGainersPage() {
  let gainers: import('@/types').Coin[] = [];
  try {
    gainers = await getTopGainers(50);
  } catch {
    // graceful fallback
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Markets
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="h-6 w-6 text-emerald-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Top Crypto Gainers</h1>
          <p className="text-sm text-zinc-400">Best performing coins in the last 24 hours · {gainers.length} coins</p>
        </div>
      </div>

      <div className="rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[2rem_1fr_7rem_7rem_9rem_9rem] px-4 py-2 border-b border-zinc-800 text-xs text-zinc-500">
          <span className="text-right">#</span>
          <span className="pl-3">Coin</span>
          <span className="text-right">Price</span>
          <span className="text-right">24h %</span>
          <span className="text-right hidden sm:block">Market Cap</span>
          <span className="text-right hidden md:block">Volume (24h)</span>
        </div>
        <div className="divide-y divide-zinc-800/40">
          {gainers.map((coin, i) => (
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
          {gainers.length === 0 && (
            <p className="px-4 py-8 text-sm text-zinc-500 text-center">Data temporarily unavailable — try again shortly.</p>
          )}
        </div>
      </div>
    </main>
  );
}
