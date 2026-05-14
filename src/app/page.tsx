import type { Metadata } from 'next';
import { getCachedTopCoins, getTopCoins, getTopGainers, getTopLosers } from '@/lib/coingecko';
import MarketStatsBar from '@/components/MarketStatsBar';
import SortableMarketTable from '@/components/SortableMarketTable';
import HomePriceAlertBanner from '@/components/HomePriceAlertBanner';
import Image from 'next/image';
import Link from 'next/link';
import { formatPct, pctColor } from '@/lib/utils';
import { TrendingUp, TrendingDown, ArrowRight, Bell, Search, Star, Database, AlertTriangle } from 'lucide-react';

export const revalidate = 300;

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

export default async function HomePage() {
  const results = await Promise.allSettled([
    getTopCoins(250),
    getTopGainers(10),
    getTopLosers(10),
  ]);
  const liveCoins = results[0].status === 'fulfilled' ? results[0].value : [];
  const liveGainers = results[1].status === 'fulfilled' ? results[1].value : [];
  const liveLosers = results[2].status === 'fulfilled' ? results[2].value : [];

  let coins = liveCoins;
  let marketDataStatus: 'live' | 'cached' | 'unavailable' = liveCoins.length > 0 ? 'live' : 'unavailable';

  if (coins.length === 0) {
    try {
      const cachedCoins = await getCachedTopCoins(250);
      if (cachedCoins.length > 0) {
        coins = cachedCoins;
        marketDataStatus = 'cached';
      }
    } catch (error) {
      console.warn('[HomePage] Cached market fallback unavailable', error);
    }
  }

  const gainers = liveGainers.length > 0
    ? liveGainers
    : coins.filter((coin) => coin.price_change_percentage_24h > 0)
      .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
      .slice(0, 10);
  const losers = liveLosers.length > 0
    ? liveLosers
    : coins.filter((coin) => coin.price_change_percentage_24h < 0)
      .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
      .slice(0, 10);

  return (
    <>
      <MarketStatsBar />
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Hero */}
        <section className="mb-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-stretch">
          <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-violet-950/30 p-5 sm:p-6">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.22em] text-violet-300">
              Live crypto price tracker
            </p>
            <h1 className="mb-3 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Live Crypto Prices, Market Cap Rankings & Price Alerts
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-zinc-300 sm:text-base">
              Track Bitcoin, Ethereum, altcoins, market cap rankings, top gainers, losers,
              and volume spikes in one fast public dashboard. Use the table to sort by price,
              market cap, 24h volume, or Vol/MCap ratio, then save coins to your watchlist or
              create a price alert when a target matters.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="#price-alerts"
                data-event="price_alert_click"
                data-cta-location="home_hero"
                className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
              >
                <Bell className="h-4 w-4" />
                Set a price alert
              </a>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-900"
              >
                <Search className="h-4 w-4" />
                Search coins
              </Link>
            </div>
          </div>

          <aside className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
            <h2 className="mb-3 text-sm font-semibold text-zinc-100">How to use Trade Potion</h2>
            <div className="space-y-3 text-sm text-zinc-300">
              <div className="flex gap-3">
                <Search className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />
                <p>
                  Search any coin or open a market category to compare price, market cap, and
                  recent movement without promotional rankings.
                </p>
              </div>
              <div className="flex gap-3">
                <Star className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                <p>
                  Click the star beside a coin to build a browser-based watchlist for repeat checks.
                </p>
              </div>
              <div className="flex gap-3">
                <Bell className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />
                <p>
                  Add email alerts for price targets. Market data is informational only, not financial advice.
                </p>
              </div>
            </div>
          </aside>
        </section>

        {marketDataStatus !== 'live' && (
          <section className={`mb-6 rounded-xl border p-4 text-sm ${
            marketDataStatus === 'cached'
              ? 'border-amber-500/30 bg-amber-950/20 text-amber-100'
              : 'border-zinc-700 bg-zinc-900/80 text-zinc-300'
          }`}>
            <div className="flex items-start gap-3">
              {marketDataStatus === 'cached' ? (
                <Database className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
              ) : (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
              )}
              <div>
                <h2 className="font-semibold text-zinc-100">
                  {marketDataStatus === 'cached' ? 'Showing cached market data' : 'Market data temporarily unavailable'}
                </h2>
                <p className="mt-1 text-xs leading-5 text-zinc-400">
                  {marketDataStatus === 'cached'
                    ? 'CoinGecko live data is temporarily unavailable, so this page is using the latest stored public price snapshots. Confirm venue data independently before acting.'
                    : 'CoinGecko live data and cached snapshots are not available right now. The search, watchlist, and alert tools remain available, but market tables may be empty until data recovers.'}
                </p>
              </div>
            </div>
          </section>
        )}

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
              {gainers.length === 0 && (
                <p className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-4 text-sm text-zinc-500">
                  No 24h gainer data is available right now. Use the full market table or search while live data refreshes.
                </p>
              )}
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
              {losers.length === 0 && (
                <p className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-4 text-sm text-zinc-500">
                  No 24h loser data is available right now. Use the full market table or search while live data refreshes.
                </p>
              )}
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

        <section id="price-alerts" className="scroll-mt-24">
          <HomePriceAlertBanner topCoins={coins.slice(0, 25)} />
        </section>

        {/* Market table — 100 coins, sortable, paginated */}
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-200">Top 100 Cryptocurrencies</h2>
          <span className="text-xs text-zinc-500">Click column headers to sort</span>
        </div>
        <SortableMarketTable coins={coins} fetchedAt={Date.now()} />
      </main>
    </>
  );
}
