import type { Metadata } from 'next';
import { getCachedTopCoins, getTopCoins, getTopGainers, getTopLosers } from '@/lib/coingecko';
import MarketStatsBar from '@/components/MarketStatsBar';
import SortableMarketTable from '@/components/SortableMarketTable';
import HomePriceAlertBanner from '@/components/HomePriceAlertBanner';
import Image from 'next/image';
import Link from 'next/link';
import { formatPct, pctColor } from '@/lib/utils';
import { TrendingUp, TrendingDown, ArrowRight, Bell, Search, Star, Database, AlertTriangle, Activity } from 'lucide-react';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Crypto Market Price Tracker | Rankings & Price Alerts',
  description:
    'Track Bitcoin, Ethereum, altcoins, market cap rankings, and price alerts. Trade Potion shows CoinGecko market snapshots when available and clearly labels cached public snapshots during provider outages.',
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

  const heroEyebrow = marketDataStatus === 'live'
    ? 'Trade Potion market dashboard'
    : marketDataStatus === 'cached'
      ? 'Crypto market snapshot'
      : 'Crypto market research tools';
  const heroTitle = marketDataStatus === 'live'
    ? 'Crypto Market Prices, Market Cap Rankings & Price Alerts'
    : marketDataStatus === 'cached'
      ? 'Crypto Market Prices, Market Cap Rankings & Price Alerts'
      : 'Crypto Price Search, Watchlists & Price Alerts';
  const heroDescription = marketDataStatus === 'live'
    ? 'Track Bitcoin, Ethereum, altcoins, market cap rankings, top gainers, losers, and volume spikes in one public dashboard. Sort the market table, save coins to your watchlist, and create informational price alerts when a target matters.'
    : marketDataStatus === 'cached'
      ? 'Search and compare crypto prices, market cap rankings, top gainers, losers, and watchlist entries in one public dashboard. Trade Potion is currently using stored CoinGecko snapshots because live rows are unavailable; alerts remain informational and may be delayed.'
      : 'Search coins, use existing watchlists, and create informational price alerts while market data recovers. Trade Potion labels unavailable data clearly and avoids promotional rankings or investment advice.';
  const heroStatusLabel = marketDataStatus === 'live'
    ? 'Market data source: CoinGecko snapshot'
    : marketDataStatus === 'cached'
      ? 'Data status: cached CoinGecko snapshot'
      : 'Data status: market tables may be temporarily empty';
  const dataStatusDetail = marketDataStatus === 'live'
    ? 'The market table shows the latest CoinGecko snapshot available to this public site. Prices can differ from exchange quotes.'
    : marketDataStatus === 'cached'
      ? 'Live CoinGecko market rows are temporarily unavailable. Showing stored snapshots; some 1h, 7d, and chart fields may be unavailable until live rows recover.'
      : 'CoinGecko market rows and cached snapshots are not available right now. Search, watchlist, and alert tools remain available while tables recover.';
  const marketTableTitle = marketDataStatus === 'live'
    ? 'Top 250 Cryptocurrencies by Market Snapshot'
    : marketDataStatus === 'cached'
      ? 'Top Cryptocurrencies by Market Snapshot'
      : 'Crypto Market Table';

  return (
    <>
      <MarketStatsBar />
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Hero */}
        <section className="mb-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-stretch">
          <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-violet-950/30 p-5 sm:p-6">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.22em] text-violet-300">
              {heroEyebrow}
            </p>
            <h1 className="mb-3 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {heroTitle}
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-zinc-300 sm:text-base">
              {heroDescription}
            </p>
            <div
              data-market-data-status={marketDataStatus}
              className={`mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
                marketDataStatus === 'live'
                  ? 'border-zinc-700 bg-zinc-950/60 text-zinc-300'
                  : marketDataStatus === 'cached'
                    ? 'border-amber-500/30 bg-amber-950/20 text-amber-100'
                    : 'border-zinc-700 bg-zinc-950/70 text-zinc-300'
              }`}
            >
              {marketDataStatus === 'live' ? (
                <Activity className="h-3.5 w-3.5 text-violet-300" />
              ) : marketDataStatus === 'cached' ? (
                <Database className="h-3.5 w-3.5" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5" />
              )}
              <span>{heroStatusLabel}</span>
            </div>
            <p className="mt-2 max-w-2xl text-xs leading-5 text-zinc-400">
              {dataStatusDetail}
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#price-alerts"
                data-event="price_alert_click"
                data-cta-location="home_hero"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-500"
              >
                <Bell className="h-4 w-4" />
                Set a price alert
              </a>
              <form
                action="/search"
                method="get"
                role="search"
                aria-label="Search crypto market snapshots"
                className="flex min-w-0 flex-1 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950/70 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/30 sm:max-w-md"
              >
                <label htmlFor="home-hero-search" className="sr-only">Search coins</label>
                <div className="flex min-w-0 flex-1 items-center gap-2 px-3">
                  <Search className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden="true" />
                  <input
                    id="home-hero-search"
                    name="q"
                    type="search"
                    placeholder="Search BTC, Akash, DeFi coins..."
                    className="min-h-11 min-w-0 flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
                  />
                </div>
                <button
                  type="submit"
                  data-event="internal_link_click"
                  data-cta-location="home_hero_search_submit"
                  className="min-h-11 shrink-0 border-l border-zinc-800 px-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-900 hover:text-white"
                >
                  Search
                </button>
              </form>
            </div>
          </div>

          <aside className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
            <h2 className="mb-3 text-sm font-semibold text-zinc-100">How to use Trade Potion</h2>
            <div className="space-y-3 text-sm text-zinc-300">
              <div className="flex gap-3">
                <Search className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />
                <p>
                  <span className="font-medium text-zinc-100">1. Search or choose a category.</span>{' '}
                  Compare price, market cap, and recent movement without promotional rankings.
                </p>
              </div>
              <div className="flex gap-3">
                <Star className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                <p>
                  <span className="font-medium text-zinc-100">2. Star coins for repeat checks.</span>{' '}
                  Your watchlist stays in this browser.
                </p>
              </div>
              <div className="flex gap-3">
                <Bell className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />
                <p>
                  <span className="font-medium text-zinc-100">3. Create informational alerts.</span>{' '}
                  Use alerts as data reminders, not financial advice.
                </p>
              </div>
            </div>
          </aside>
        </section>


        {/* Gainers / Losers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-zinc-200">Top Gainers (24h)</h2>
              </div>
              <Link
                href="/top/gainers"
                data-event="internal_link_click"
                data-cta-location="home_top_gainers"
                className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
              >
                See all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <p className="mb-3 rounded-lg border border-emerald-500/15 bg-emerald-950/10 px-3 py-2 text-xs leading-5 text-zinc-400">
              24h movers are market-snapshot signals. Extreme percentages can come from small or low-liquidity assets, not Trade Potion recommendations.
            </p>
            <div className="flex flex-col gap-1.5">
              {gainers.length === 0 && (
                <p className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-4 text-sm text-zinc-500">
                  No 24h gainer data is available right now. Use the full market table or search while live data refreshes.
                </p>
              )}
              {gainers.map((coin) => (
                <Link
                  key={coin.id}
                  href={`/coins/${coin.id}`}
                  data-event="internal_link_click"
                  data-cta-location="home_gainer_coin"
                  data-coin-id={coin.id}
                  data-coin-symbol={coin.symbol}
                  className="flex items-center gap-2 text-sm hover:bg-zinc-800 rounded px-1 py-0.5 transition-colors"
                >
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
              <Link
                href="/top/losers"
                data-event="internal_link_click"
                data-cta-location="home_top_losers"
                className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
              >
                See all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <p className="mb-3 rounded-lg border border-red-500/15 bg-red-950/10 px-3 py-2 text-xs leading-5 text-zinc-400">
              24h loser rows are context for further research. Verify liquidity, venue pricing, and regional rules independently.
            </p>
            <div className="flex flex-col gap-1.5">
              {losers.length === 0 && (
                <p className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-4 text-sm text-zinc-500">
                  No 24h loser data is available right now. Use the full market table or search while live data refreshes.
                </p>
              )}
              {losers.map((coin) => (
                <Link
                  key={coin.id}
                  href={`/coins/${coin.id}`}
                  data-event="internal_link_click"
                  data-cta-location="home_loser_coin"
                  data-coin-id={coin.id}
                  data-coin-symbol={coin.symbol}
                  className="flex items-center gap-2 text-sm hover:bg-zinc-800 rounded px-1 py-0.5 transition-colors"
                >
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

        {/* Market table — up to 250 coins, sortable, paginated */}
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-zinc-200">{marketTableTitle}</h2>
          <span className="text-xs text-zinc-500">Sorted by market cap by default. Click column headers to sort; dashes mean a metric is unavailable from the current source.</span>
        </div>
        <SortableMarketTable coins={coins} fetchedAt={Date.now()} />
      </main>
    </>
  );
}
