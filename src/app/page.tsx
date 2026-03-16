import { getTopCoins, getTopGainers, getTopLosers } from '@/lib/coingecko';
import MarketStatsBar from '@/components/MarketStatsBar';
import SortableMarketTable from '@/components/SortableMarketTable';
import Image from 'next/image';
import Link from 'next/link';
import { formatPct, pctColor } from '@/lib/utils';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

export const revalidate = 300;

export default async function HomePage() {
  const [coins, gainers, losers] = await Promise.all([
    getTopCoins(100),
    getTopGainers(10),
    getTopLosers(10),
  ]);

  return (
    <>
      <MarketStatsBar />
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Hero */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Crypto Markets</h1>
          <p className="text-sm text-zinc-400">
            Live prices for 10,000+ coins. Sortable, searchable, with price alerts.
          </p>
        </div>

        {/* Gainers / Losers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-zinc-200">Top Gainers (24h)</h2>
              </div>
              <Link href="/top/gainers" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                See all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="flex flex-col gap-1.5">
              {gainers.map((coin) => (
                <Link key={coin.id} href={`/coins/${coin.id}`} className="flex items-center gap-2 text-sm hover:bg-zinc-800 rounded px-1 py-0.5 transition-colors">
                  <Image src={coin.image} alt={coin.name} width={18} height={18} className="rounded-full shrink-0" />
                  <span className="text-zinc-300 flex-1 truncate">{coin.name}</span>
                  <span className={`font-medium shrink-0 ${pctColor(coin.price_change_percentage_24h)}`}>
                    {formatPct(coin.price_change_percentage_24h)}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-400" />
                <h2 className="text-sm font-semibold text-zinc-200">Top Losers (24h)</h2>
              </div>
              <Link href="/top/losers" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                See all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="flex flex-col gap-1.5">
              {losers.map((coin) => (
                <Link key={coin.id} href={`/coins/${coin.id}`} className="flex items-center gap-2 text-sm hover:bg-zinc-800 rounded px-1 py-0.5 transition-colors">
                  <Image src={coin.image} alt={coin.name} width={18} height={18} className="rounded-full shrink-0" />
                  <span className="text-zinc-300 flex-1 truncate">{coin.name}</span>
                  <span className={`font-medium shrink-0 ${pctColor(coin.price_change_percentage_24h)}`}>
                    {formatPct(coin.price_change_percentage_24h)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Market table — 100 coins, sortable, paginated */}
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-200">Top 100 Cryptocurrencies</h2>
          <span className="text-xs text-zinc-500">Click column headers to sort</span>
        </div>
        <SortableMarketTable coins={coins} />
      </main>
    </>
  );
}
