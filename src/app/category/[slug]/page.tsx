import { getCategories, getCoinsByCategory } from '@/lib/coingecko';
import CoinRow from '@/components/CoinRow';
import Link from 'next/link';
import { ArrowLeft, Bell, Search } from 'lucide-react';
import { formatMarketCap, formatPct, pctColor } from '@/lib/utils';

export const revalidate = 300;

interface CategoryMeta {
  title: string;
  description: string;
  h1: string;
  h2: string;
  intro?: string; // populated by Emma — empty until her doc lands
  fallbackCoins?: { name: string; href: string }[];
  relatedCategories?: { label: string; href: string }[];
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  defi: { title: 'DeFi Tokens Price Tracker | Top DeFi Cryptocurrency Prices',
    description: 'Track prices for 500+ DeFi tokens including Aave, Uniswap, Curve. Live DeFi coin prices, charts, and alerts.',
    h1: 'DeFi Tokens',
    h2: 'Top DeFi Tokens by Market Cap',
    intro: 'DeFi tokens power open financial protocols for lending, swaps, derivatives, and governance. Track Aave, Uniswap, Curve, and other DeFi assets with live market data, watchlist stars, and optional price alerts. Category moves can reflect protocol usage, liquidity shifts, governance news, exchange activity, or wider market conditions, so use these pages for research rather than financial advice.',
    fallbackCoins: [
      { name: 'Aave', href: '/coins/aave' },
      { name: 'Uniswap', href: '/coins/uniswap' },
      { name: 'Curve DAO', href: '/coins/curve-dao-token' },
    ],
    relatedCategories: [
      { label: 'Liquid staking', href: '/category/liquid-staking' },
      { label: 'Governance tokens', href: '/category/governance' },
      { label: 'Smart contract platforms', href: '/category/smart-contract-platform' },
    ],
  },
  'decentralized-finance-defi': { title: 'DeFi Tokens Price Tracker | Top DeFi Cryptocurrency Prices',
    description: 'Track prices for 500+ DeFi tokens including Aave, Uniswap, Curve. Live DeFi coin prices, charts, and alerts.',
    h1: 'DeFi Tokens',
    h2: 'Top DeFi Tokens by Market Cap',
    intro: 'DeFi tokens power open financial protocols for lending, swaps, derivatives, and governance. Track Aave, Uniswap, Curve, and other DeFi assets with live market data, watchlist stars, and optional price alerts. Category moves can reflect protocol usage, liquidity shifts, governance news, exchange activity, or wider market conditions, so use these pages for research rather than financial advice.',
    fallbackCoins: [
      { name: 'Aave', href: '/coins/aave' },
      { name: 'Uniswap', href: '/coins/uniswap' },
      { name: 'Curve DAO', href: '/coins/curve-dao-token' },
    ],
    relatedCategories: [
      { label: 'Liquid staking', href: '/category/liquid-staking' },
      { label: 'Governance tokens', href: '/category/governance' },
      { label: 'Smart contract platforms', href: '/category/smart-contract-platform' },
    ],
  },
  'layer-2': { title: 'Layer 2 Coin Prices | Arbitrum, Optimism, Polygon Tracker',
    description: 'Live prices for Ethereum Layer 2 tokens: Arbitrum, Optimism, Polygon, and more. Real-time tracking and alerts.',
    h1: 'Layer 2 Tokens',
    h2: 'Top Layer 2 Tokens by Market Cap',
    intro: 'Layer 2 tokens power networks that aim to make Ethereum and related ecosystems faster and cheaper. Track Arbitrum, Optimism, Polygon, and other scaling assets with live prices, watchlist stars, and optional price alerts. Category movement can reflect network usage, bridge activity, governance news, exchange liquidity, or wider market conditions; it is not a forecast or recommendation.',
    fallbackCoins: [
      { name: 'Arbitrum', href: '/coins/arbitrum' },
      { name: 'Optimism', href: '/coins/optimism' },
      { name: 'Polygon', href: '/coins/polygon-ecosystem-token' },
    ],
    relatedCategories: [
      { label: 'Smart contract platforms', href: '/category/smart-contract-platform' },
      { label: 'Infrastructure tokens', href: '/category/infrastructure' },
      { label: 'DeFi tokens', href: '/category/decentralized-finance-defi' },
    ],
  },
  'layer-1': {
    title: 'Layer 1 Blockchain Prices | BTC, ETH, SOL Tracker',
    description: 'Live prices for Layer 1 blockchain tokens: Bitcoin, Ethereum, Solana, Avalanche, and more.',
    h1: 'Layer 1 Blockchains',
    h2: 'Top Layer 1 Blockchains by Market Cap',
    intro: '',
  },
  'meme-token': { title: 'Meme Coin Prices | Doge, Shiba, Pepe Tracker',
    description: 'Track live prices for meme coins: Dogecoin, Shiba Inu, Pepe, and 1000+ more. Real-time meme token prices.',
    h1: 'Meme Coins',
    h2: 'Top Meme Coins by Market Cap',
    intro: 'Meme coins are community-driven tokens whose prices can move quickly around social attention, liquidity changes, exchange listings, and broader risk appetite. Track Dogecoin, Shiba Inu, Pepe, and other meme tokens with live market data, watchlist stars, and optional price alerts. Treat this page as a monitoring dashboard, not a recommendation to buy or trade.',
    fallbackCoins: [
      { name: 'Dogecoin', href: '/coins/dogecoin' },
      { name: 'Shiba Inu', href: '/coins/shiba-inu' },
      { name: 'Pepe', href: '/coins/pepe' },
    ],
    relatedCategories: [
      { label: 'Top gainers', href: '/top/gainers' },
      { label: 'Trending coins', href: '/top/trending' },
      { label: 'New listings', href: '/top/new-listings' },
    ],
  },
  stablecoins: {
    title: 'Stablecoin Prices | USDT, USDC, DAI Tracker',
    description: 'Track live prices for stablecoins: Tether, USDC, DAI, and more. Monitor USD-pegged token prices and market cap.',
    h1: 'Stablecoins',
    h2: 'Top Stablecoins by Market Cap',
    intro: '',
  },
  'smart-contract-platform': {
    title: 'Smart Contract Platform Tokens | ETH, SOL, AVAX Prices',
    description: 'Live prices for smart contract platform tokens: Ethereum, Solana, Avalanche, Cardano, and more.',
    h1: 'Smart Contract Platforms',
    h2: 'Top Smart Contract Platforms by Market Cap',
    intro: '',
  },
  infrastructure: {
    title: 'Crypto Infrastructure Tokens | Live Prices & Market Data',
    description: 'Track prices for blockchain infrastructure tokens. Real-time data for oracles, bridges, and protocol tooling.',
    h1: 'Infrastructure Tokens',
    h2: 'Top Infrastructure Tokens by Market Cap',
    intro: '',
  },
  'real-world-assets': {
    title: 'Real World Asset (RWA) Tokens | Live Crypto Prices',
    description: 'Track live prices for real-world asset tokens — tokenised bonds, real estate, and commodities on-chain.',
    h1: 'Real World Assets (RWA)',
    h2: 'Top Real World Asset Tokens by Market Cap',
    intro: '',
  },
  governance: {
    title: 'Governance Tokens | DAO Voting Token Prices',
    description: 'Live prices for governance tokens used in DAO voting: Uniswap, Compound, Aave, and more.',
    h1: 'Governance Tokens',
    h2: 'Top Governance Tokens by Market Cap',
    intro: '',
  },
  privacy: {
    title: 'Privacy Coin Prices | Monero, Zcash, Dash Tracker',
    description: 'Track live prices for privacy coins: Monero, Zcash, Dash, and more. Real-time privacy token market data.',
    h1: 'Privacy Coins',
    h2: 'Top Privacy Coins by Market Cap',
    intro: '',
  },
  'artificial-intelligence': { title: 'AI Crypto Token Prices | Top Artificial Intelligence Coins',
    description: 'Live prices for AI crypto tokens: Fetch.ai, Render, Akash, and more. Track the AI and machine learning coin market.',
    h1: 'AI & Machine Learning Tokens',
    h2: 'Top AI Tokens by Market Cap',
    intro: 'AI crypto tokens sit around decentralized compute, data networks, agent infrastructure, and machine-learning marketplaces. Track Render, Akash, Fetch.ai, and related AI assets with live market data, watchlist stars, and optional price alerts. Price moves can reflect GPU demand, product news, token liquidity, or broader crypto sentiment; this page is informational only and not financial advice.',
    fallbackCoins: [
      { name: 'Akash Network', href: '/coins/akash-network' },
      { name: 'Render', href: '/coins/render-token' },
      { name: 'Bittensor', href: '/coins/bittensor' },
    ],
    relatedCategories: [
      { label: 'Infrastructure tokens', href: '/category/infrastructure' },
      { label: 'Layer 1 blockchains', href: '/category/layer-1' },
      { label: 'Top trending', href: '/top/trending' },
    ],
  },
  'liquid-staking': { title: 'Liquid Staking Token Prices | stETH, rETH, mSOL Tracker',
    description: 'Track live prices for liquid staking tokens: stETH, rETH, mSOL, and more. Real-time LST market data.',
    h1: 'Liquid Staking Tokens',
    h2: 'Top Liquid Staking Tokens by Market Cap',
    intro: 'Liquid staking tokens (LSTs) represent staked assets that can still move through parts of the crypto ecosystem. Track stETH, rETH, mSOL, and other LSTs with live prices, watchlist stars, and optional price alerts. Values can be affected by staking yields, liquidity, protocol risk, slashing risk, and governance changes, so use the data for research rather than financial advice.',
    fallbackCoins: [
      { name: 'Lido Staked Ether', href: '/coins/staked-ether' },
      { name: 'Rocket Pool ETH', href: '/coins/rocket-pool-eth' },
      { name: 'Marinade Staked SOL', href: '/coins/msol' },
    ],
    relatedCategories: [
      { label: 'DeFi tokens', href: '/category/decentralized-finance-defi' },
      { label: 'Governance tokens', href: '/category/governance' },
      { label: 'Smart contract platforms', href: '/category/smart-contract-platform' },
    ],
  },
};

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const meta = CATEGORY_META[params.slug];
  const displayName = params.slug.replace(/-/g, ' ');
  const title = meta?.title ?? `${displayName} Coin Prices`;
  const description =
    meta?.description ??
    `Live prices for ${displayName} tokens. Real-time tracking and price alerts on Trade Potion.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://tradepotion.com/category/${params.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://tradepotion.com/category/${params.slug}`,
      type: 'website' as const,
    },
    twitter: {
      card: 'summary' as const,
      title,
      description,
    },
  };
}

interface Props {
  params: { slug: string };
}

export default async function CategoryPage({ params }: Props) {
  // Fetch coins and category info independently — a 429 on one shouldn't kill the page
  const [coinsResult, categoriesResult] = await Promise.allSettled([
    getCoinsByCategory(params.slug, 50),
    getCategories(),
  ]);

  const coins = coinsResult.status === 'fulfilled' ? coinsResult.value : [];
  const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];

  // Log rate limit warnings server-side but don't crash
  if (coinsResult.status === 'rejected') {
    console.warn('[category] getCoinsByCategory failed:', coinsResult.reason);
  }
  if (categoriesResult.status === 'rejected') {
    console.warn('[category] getCategories failed:', categoriesResult.reason);
  }

  const category = categories.find((c) => c.id === params.slug);
  const meta = CATEGORY_META[params.slug];

  // H1: prefer explicit meta.h1, then CoinGecko category name, then slug-derived
  const displayName = params.slug.replace(/-/g, ' ');
  const description = meta?.description ?? `Live prices for ${displayName} tokens. Real-time tracking and price alerts on Trade Potion.`;
  const h1 = meta?.h1 ?? category?.name ?? displayName;
  const h2 = meta?.h2 ?? `Top ${h1} by Market Cap`;
  const intro = meta?.intro ?? null;
  const fallbackCoins = meta?.fallbackCoins ?? [
    { name: 'Bitcoin', href: '/coins/bitcoin' },
    { name: 'Ethereum', href: '/coins/ethereum' },
    { name: 'Solana', href: '/coins/solana' },
  ];
  const relatedCategories = meta?.relatedCategories ?? [
    { label: 'Top gainers', href: '/top/gainers' },
    { label: 'Top losers', href: '/top/losers' },
    { label: 'Trending coins', href: '/top/trending' },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Category schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Markets', item: 'https://tradepotion.com' },
                  { '@type': 'ListItem', position: 2, name: h1, item: `https://tradepotion.com/category/${params.slug}` },
                ],
              },
              {
                '@type': 'WebPage',
                name: h1,
                url: `https://tradepotion.com/category/${params.slug}`,
                description,
                isPartOf: { '@type': 'WebSite', name: 'Trade Potion', url: 'https://tradepotion.com' },
                about: `${h1} cryptocurrency market data`,
              },
            ],
          }),
        }}
      />

      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Markets
      </Link>

      {/* Page header */}
      <section className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-stretch">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
          <h1 className="text-2xl font-bold text-white">{h1}</h1>
          {category && (
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-zinc-400">
              <span>
                Market cap:{' '}
                <strong className="text-white">{formatMarketCap(category.market_cap)}</strong>
              </span>
              {category.market_cap_change_24h !== undefined && (
                <span className={pctColor(category.market_cap_change_24h)}>
                  {formatPct(category.market_cap_change_24h)} (24h)
                </span>
              )}
            </div>
          )}
          {intro && (
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-zinc-400">
              {intro}
            </p>
          )}
          <p className="mt-3 text-xs text-zinc-500">
            Data provided by CoinGecko. Prices may be delayed or temporarily unavailable.
            Informational market research only — not financial advice.
          </p>
        </div>

        <aside className="rounded-2xl border border-violet-800/40 bg-gradient-to-br from-violet-950/50 to-zinc-900 p-5">
          <h2 className="text-sm font-semibold text-white">Track this category</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Search a token, star it for your browser watchlist, or set an email alert from the homepage.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/#price-alerts"
              data-event="price_alert_click"
              data-cta-location="category_hero"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
            >
              <Bell className="h-4 w-4" />
              Set a price alert
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-900"
            >
              <Search className="h-4 w-4" />
              Search coins
            </Link>
          </div>
        </aside>
      </section>

      {/* Coin table section */}
      <section aria-labelledby="category-table-heading">
        <h2
          id="category-table-heading"
          className="text-base font-semibold text-zinc-300 mb-3"
        >
          {h2}
        </h2>

        <div className="rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden">
          <div className="divide-y divide-zinc-800/50">
            {coins.map((coin, i) => (
              <CoinRow key={coin.id} coin={coin} rank={i + 1} />
            ))}
            {coins.length === 0 && (
              <div className="px-4 py-8 text-center">
                <p className="text-sm font-medium text-zinc-300">
                  {coinsResult.status === 'rejected'
                    ? 'Live category prices are temporarily unavailable.'
                    : 'No live rows are available for this category yet.'}
                </p>
                <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                  You can still research popular tokens, search the full market list, or set a homepage alert
                  while CoinGecko category data refreshes.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {fallbackCoins.map((coin) => (
                    <Link
                      key={coin.href}
                      href={coin.href}
                      className="rounded-full border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:border-violet-500 hover:text-white"
                    >
                      {coin.name}
                    </Link>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
                  {relatedCategories.map((item) => (
                    <Link key={item.href} href={item.href} className="text-violet-300 hover:text-violet-200">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
