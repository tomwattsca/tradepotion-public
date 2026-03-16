import { getTrendingCoins, getTopGainers, getTopLosers } from '@/lib/coingecko';
import CoinRow from '@/components/CoinRow';
import HomePriceAlertBanner from '@/components/HomePriceAlertBanner';
import { formatPct, pctColor } from '@/lib/utils';
import Image from 'next/image';
import { TrendingUp, TrendingDown, Flame } from 'lucide-react';

export const revalidate = 60;

export default async function HomePage() {
  const [trending, gainers, losers] = await Promise.all([
    getTrendingCoins(20),
    getTopGainers(5),
    getTopLosers(5),
  ]);

  // Top 20 coins for the alert banner coin selector
  const alertCoins = trending.map((c) => ({
    id: c.id,
    name: c.name,
    symbol: c.symbol,
    current_price: c.current_price,
  }));

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Crypto Markets</h1>
        <p className="text-sm text-zinc-400">
          Live prices, gainers, and losers across 10,000+ altcoins.
        </p>
      </div>

      {/* Price Alert Banner */}
      <HomePriceAlertBanner topCoins={alertCoins} />

      {/* Gainers / Losers strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Gainers */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-zinc-200">Top Gainers (24h)</h2>
          </div>
          <div className="flex flex-col gap-1">
            {gainers.map((coin) => (
              <div key={coin.id} className="flex items-center gap-2 text-sm">
                <Image src={coin.image} alt={coin.name} width={20} height={20} className="h-5 w-5 rounded-full" />
                <span className="text-zinc-300 flex-1 truncate">{coin.name}</span>
                <span className={`font-medium ${pctColor(coin.price_change_percentage_24h)}`}>
                  {formatPct(coin.price_change_percentage_24h)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Losers */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="h-4 w-4 text-red-400" />
            <h2 className="text-sm font-semibold text-zinc-200">Top Losers (24h)</h2>
          </div>
          <div className="flex flex-col gap-1">
            {losers.map((coin) => (
              <div key={coin.id} className="flex items-center gap-2 text-sm">
                <Image src={coin.image} alt={coin.name} width={20} height={20} className="h-5 w-5 rounded-full" />
                <span className="text-zinc-300 flex-1 truncate">{coin.name}</span>
                <span className={`font-medium ${pctColor(coin.price_change_percentage_24h)}`}>
                  {formatPct(coin.price_change_percentage_24h)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Market table */}
      <div className="rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
          <Flame className="h-4 w-4 text-violet-400" />
          <h2 className="text-sm font-semibold text-zinc-200">Top 20 by Market Cap</h2>
        </div>
        <div className="divide-y divide-zinc-800/50">
          {trending.map((coin, i) => (
            <CoinRow key={coin.id} coin={coin} rank={i + 1} />
          ))}
        </div>
      </div>
    </main>
  );
}
