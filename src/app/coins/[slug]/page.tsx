import { getCoinDetail, getCoinMarketChart, filterCategories } from '@/lib/coingecko';
import type { CoinDetailImage } from '@/types';
import { formatPrice, formatMarketCap, formatPct, pctColor } from '@/lib/utils';
import PriceChart from '@/components/PriceChart';
import ExchangeCTAs from '@/components/ExchangeCTAs';
import PriceAlertForm from '@/components/PriceAlertForm';
import WatchlistStar from '@/components/WatchlistStar';
import InsightPanel from '@/components/InsightPanel';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Bell, ExternalLink, Search } from 'lucide-react';
import type { Metadata } from 'next';

// CoinGecko free tier returns incorrect ATL/ATH for some flagship coins
// (e.g. BTC ATL returns 2013 low $67 instead of 2010 ATL ~$0.05)
// These are sourced from CoinGecko Pro and CoinMarketCap historical records
const ATL_OVERRIDES: Record<string, number> = {
  bitcoin: 0.04865,       // 2010-07-12 (Mt Gox)
  ethereum: 0.4209,       // 2015-10-20
  binancecoin: 0.0398,    // 2017-10-19
  solana: 0.5008,         // 2020-05-11
  dogecoin: 0.0000869,    // 2015-05-06
  cardano: 0.01735,       // 2018-10-01
  ripple: 0.002802,       // 2013-08-05 (XRP)
  litecoin: 1.11,         // 2015-01-14
  'bitcoin-cash': 75.07,  // 2018-12-16
  polkadot: 1.75,         // 2020-08-20
};

const ATH_OVERRIDES: Record<string, number> = {};


function categorySlug(category: string): string {
  return category.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function CoinMarketContext({
  coinName,
  symbol,
  price,
  marketCap,
  volume24h,
  pct24h,
  pct7d,
  pct30d,
  categories,
}: {
  coinName: string;
  symbol: string;
  price: number;
  marketCap: number;
  volume24h: number;
  pct24h: number;
  pct7d: number;
  pct30d: number;
  categories: string[];
}) {
  const uppercaseSymbol = symbol.toUpperCase();
  const primaryCategory = categories[0];
  return (
    <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
      <h2 className="text-sm font-semibold text-zinc-300 mb-3">How to read the {uppercaseSymbol} market data</h2>
      <div className="space-y-4 text-sm text-zinc-400 leading-relaxed">
        <p>
          This page tracks live {coinName} ({uppercaseSymbol}) market data: current USD price, 24-hour volume, market cap,
          supply figures, recent percentage changes, and historical high/low levels. These signals describe recent market
          activity; they are not a forecast or a recommendation.
        </p>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-300 mb-1">{uppercaseSymbol} market snapshot</h3>
          <p>
            Current price is {formatPrice(price)}, market cap is {formatMarketCap(marketCap)}, and 24-hour volume is {formatMarketCap(volume24h)}.
            Recent moves: {formatPct(pct24h)} over 24 hours, {formatPct(pct7d)} over 7 days, and {formatPct(pct30d)} over 30 days.
          </p>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-300 mb-1">What can affect {uppercaseSymbol} price?</h3>
          <p>
            Price can move with broader crypto liquidity, exchange volume, protocol news, token supply changes, category-specific sentiment,
            and large market orders. For smaller assets, thin liquidity can make short-term percentage changes noisier.
          </p>
        </div>
        {categories.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-300 mb-2">Categories and related research</h3>
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 5).map((category) => (
                <Link
                  key={category}
                  href={`/category/${categorySlug(category)}`}
                  className="rounded-full border border-zinc-700 px-2.5 py-1 text-xs text-violet-300 hover:border-violet-500 hover:text-violet-200"
                >
                  {category}
                </Link>
              ))}
            </div>
            {primaryCategory && (
              <p className="mt-2 text-xs text-zinc-500">
                Category pages help compare {coinName} with other assets in similar market segments when category data is available.
              </p>
            )}
          </div>
        )}
        <p className="text-xs text-zinc-500">
          Crypto assets are volatile. Use this page for market research alongside independent due diligence; Trade Potion does not provide financial advice.
        </p>
      </div>
    </section>
  );
}

function getAtl(coinId: string, apiAtl: number): number {
  const override = ATL_OVERRIDES[coinId];
  if (!override) return apiAtl;
  // Use override only if API value looks wrong (>10x the known ATL)
  if (apiAtl > override * 10) return override;
  return apiAtl;
}

function getAth(coinId: string, apiAth: number): number {
  return ATH_OVERRIDES[coinId] ?? apiAth;
}


export const revalidate = 60;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const coin = await getCoinDetail(params.slug);
    const price = coin.market_data.current_price.usd;
    const priceStr = price >= 1
      ? price.toLocaleString('en-US', { maximumFractionDigits: 2 })
      : price.toFixed(6);
    const name = coin.name;
    const symbol = coin.symbol.toUpperCase();

    return {
      title: `${name} (${symbol}) Price`,
      description: `Live ${name} (${symbol}) price: $${priceStr}. Track ${name} price history, market cap, and charts. Set price alerts on Trade Potion.`,
      alternates: { canonical: `https://tradepotion.com/coins/${params.slug}` },
      openGraph: {
        title: `${name} Price: $${priceStr} USD`,
        description: `View live ${name} (${symbol}) price, charts, and market data on Trade Potion.`,
        url: `https://tradepotion.com/coins/${params.slug}`,
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title: `${name} (${symbol}) Price`,
        description: `${name} price: $${priceStr}. Live tracking and alerts.`,
      },
    };
  } catch {
    return {
      title: 'Coin Price',
      description: 'Live crypto price tracking on Trade Potion.',
    };
  }
}

export default async function CoinPage({ params }: Props) {
  let coin;
  try {
    coin = await getCoinDetail(params.slug);
  } catch {
    notFound();
  }

  const md = coin.market_data;
  const price = md.current_price.usd;
  const pct24h = md.price_change_percentage_24h ?? coin.price_change_percentage_24h ?? 0;
  const pct7d = md.price_change_percentage_7d;
  const pct30d = md.price_change_percentage_30d;
  const filteredCategories = filterCategories(coin.id, coin.categories ?? []);

  let chart30d = { market_caps: [] as [number, number][], total_volumes: [] as [number, number][] };
  try {
    chart30d = await getCoinMarketChart(coin.id, '30');
  } catch (error) {
    console.warn(`[CoinPage] Could not load 30d market insight data for ${coin.id}`, error);
  }

  const stats = [
    { label: 'Market Cap', value: formatMarketCap(md.market_cap.usd) },
    { label: '24h Volume', value: formatMarketCap(md.total_volume.usd) },
    { label: 'Circulating Supply', value: md.circulating_supply?.toLocaleString() ?? '—' },
    { label: 'Total Supply', value: md.total_supply?.toLocaleString() ?? '∞' },
    { label: 'All-Time High', value: formatPrice(getAth(params.slug, md.ath.usd)) },
    { label: 'All-Time Low', value: formatPrice(getAtl(params.slug, md.atl.usd)) },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">

      {/* Breadcrumb schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Markets', item: 'https://tradepotion.com' },
              { '@type': 'ListItem', position: 2, name: 'Coins', item: 'https://tradepotion.com' },
              { '@type': 'ListItem', position: 3, name: `${coin.name} (${coin.symbol.toUpperCase()})`, item: `https://tradepotion.com/coins/${params.slug}` },
            ],
          }),
        }}
      />

      {/* Coin market data page schema. Keep this informational: do not model crypto assets as in-stock products/offers. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            '@id': `https://tradepotion.com/coins/${params.slug}#webpage`,
            url: `https://tradepotion.com/coins/${params.slug}`,
            name: `${coin.name} (${coin.symbol.toUpperCase()}) Price`,
            description: `Live ${coin.name} (${coin.symbol.toUpperCase()}) market data including USD price, market cap, volume, supply, and recent performance.`,
            isPartOf: {
              '@type': 'WebSite',
              '@id': 'https://tradepotion.com/#website',
              name: 'Trade Potion',
              url: 'https://tradepotion.com',
            },
            about: {
              '@type': 'Thing',
              name: `${coin.name} (${coin.symbol.toUpperCase()})`,
              url: coin.links?.homepage?.[0] || `https://tradepotion.com/coins/${params.slug}`,
            },
            primaryImageOfPage: {
              '@type': 'ImageObject',
              url: (coin.image as unknown as CoinDetailImage).large ?? (coin.image as unknown as CoinDetailImage).small,
            },
          }),
        }}
      />

      {/* Back */}
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Markets
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Image
          src={(coin.image as unknown as CoinDetailImage).small}
          alt={coin.name}
          width={48}
          height={48}
          className="rounded-full"
        />
        <div>
          <h1 className="text-2xl font-bold text-white">
            {coin.name}{' '}
            <span className="text-zinc-500 font-normal text-base uppercase">{coin.symbol}</span>
          </h1>
          {coin.market_cap_rank && (
            <span className="text-xs text-zinc-500">Rank #{coin.market_cap_rank}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2 md:ml-2">
          <a
            href="#alert"
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors"
            data-event="price_alert_click"
            data-cta-location="coin_hero"
            data-coin-id={coin.id}
            aria-label={`Set a price alert for ${coin.name}`}
          >
            <Bell className="h-4 w-4" />
            Set {coin.symbol.toUpperCase()} alert
          </a>
          <Link
            href={`/search?q=${encodeURIComponent(coin.symbol.toUpperCase())}`}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-300 hover:border-violet-500 hover:text-violet-200 transition-colors"
          >
            <Search className="h-4 w-4" />
            Search markets
          </Link>
        </div>
        <div className="ml-auto flex items-start gap-3">
          <div className="text-right">
            <p className="text-3xl font-bold text-white">{formatPrice(price)}</p>
            <p className={`text-sm font-medium ${pctColor(pct24h)}`}>
              {formatPct(pct24h)} (24h)
            </p>
          </div>
          <WatchlistStar coinId={coin.id} coinName={coin.name} />
        </div>
      </div>

      {/* % changes strip */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: '24h', pct: pct24h },
          { label: '7d', pct: pct7d },
          { label: '30d', pct: pct30d },
        ].map((item) => (
          <div key={item.label} className="rounded-lg bg-zinc-900 border border-zinc-800 p-3 text-center">
            <p className={`text-lg font-semibold ${pctColor(item.pct)}`}>{formatPct(item.pct)}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart — 2 cols */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <PriceChart coinId={coin.id} />

          {/* Stats */}
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
            <h2 className="text-sm font-semibold text-zinc-300 mb-3">Market Stats</h2>
            <div className="grid grid-cols-2 gap-3">
              {stats.map((s) => (
                <div key={s.label} className="rounded-lg bg-zinc-950 p-3">
                  <p className="text-xs text-zinc-500 mb-0.5">{s.label}</p>
                  <p className="text-sm font-medium text-white">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          <CoinMarketContext
            coinName={coin.name}
            symbol={coin.symbol}
            price={price}
            marketCap={md.market_cap.usd}
            volume24h={md.total_volume.usd}
            pct24h={pct24h}
            pct7d={pct7d}
            pct30d={pct30d}
            categories={filteredCategories}
          />

          {/* About */}
          {coin.description?.en && (
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
              <h2 className="text-sm font-semibold text-zinc-300 mb-2">About {coin.name}</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {coin.name} is tracked on Trade Potion with live market data from CoinGecko, including price, market cap, volume, supply, and recent performance windows.
                Project descriptions and external links can change over time, so use official sources for protocol-specific details.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <InsightPanel
            coinId={coin.id}
            coinName={coin.name}
            symbol={coin.symbol}
            marketCap={md.market_cap.usd}
            volume24h={md.total_volume.usd}
            marketCaps={chart30d.market_caps}
            totalVolumes={chart30d.total_volumes}
            categories={filteredCategories}
          />

          <ExchangeCTAs coinSymbol={coin.symbol} coinName={coin.name} />

          <div id="alert"><PriceAlertForm coinId={coin.id} coinName={coin.name} currentPrice={price} ctaLocation="coin_alert_form" /></div>

          {/* Links */}
          {coin.links?.homepage?.[0] && (
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
              <h3 className="text-sm font-semibold text-zinc-300 mb-2">Links</h3>
              <div className="flex flex-col gap-2 text-sm">
                {coin.links.homepage[0] && (
                  <a
                    href={coin.links.homepage[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-violet-400 hover:text-violet-300"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Website
                  </a>
                )}
                {coin.links.twitter_screen_name && (
                  <a
                    href={`https://twitter.com/${coin.links.twitter_screen_name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-violet-400 hover:text-violet-300"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Twitter
                  </a>
                )}
                {coin.links.subreddit_url && (
                  <a
                    href={coin.links.subreddit_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-violet-400 hover:text-violet-300"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Reddit
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Categories */}
          {filteredCategories.length > 0 && (
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
              <h3 className="text-sm font-semibold text-zinc-300 mb-2">Categories</h3>
              <div className="flex flex-wrap gap-1.5">
                {filteredCategories.slice(0, 8).map((cat) => (
                  <span
                    key={cat}
                    className="px-2 py-0.5 rounded text-xs bg-zinc-800 text-zinc-400"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
