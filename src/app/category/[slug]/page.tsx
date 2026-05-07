import { getCategories, getCoinsByCategory } from '@/lib/coingecko';
import CoinRow from '@/components/CoinRow';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { formatMarketCap, formatPct, pctColor } from '@/lib/utils';

export const revalidate = 300;

interface CategoryMeta {
  title: string;
  description: string;
  h1: string;
  h2: string;
  intro?: string; // populated by Emma — empty until her doc lands
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  defi: { title: 'DeFi Tokens Price Tracker | Top DeFi Cryptocurrency Prices',
    description: 'Track prices for 500+ DeFi tokens including Aave, Uniswap, Curve. Live DeFi coin prices, charts, and alerts.',
    h1: 'DeFi Tokens',
    h2: 'Top DeFi Tokens by Market Cap',
    intro: 'DeFi tokens power open financial protocols that replace traditional intermediaries like banks and exchanges. These coins unlock lending, swaps, derivatives, and yield farming — all running on permissionless blockchains. Track prices for Aave, Uniswap, Curve, and 500+ DeFi tokens on Trade Potion with real-time price alerts. Unlike traditional finance, DeFi composability means tokens often derive value from their network activity and governance rights. A spike in DEX volume or new protocol launches can move entire category prices instantly.',
  },
  'decentralized-finance-defi': { title: 'DeFi Tokens Price Tracker | Top DeFi Cryptocurrency Prices',
    description: 'Track prices for 500+ DeFi tokens including Aave, Uniswap, Curve. Live DeFi coin prices, charts, and alerts.',
    h1: 'DeFi Tokens',
    h2: 'Top DeFi Tokens by Market Cap',
    intro: 'DeFi tokens power open financial protocols that replace traditional intermediaries like banks and exchanges. These coins unlock lending, swaps, derivatives, and yield farming — all running on permissionless blockchains. Track prices for Aave, Uniswap, Curve, and 500+ DeFi tokens on Trade Potion with real-time price alerts. Unlike traditional finance, DeFi composability means tokens often derive value from their network activity and governance rights. A spike in DEX volume or new protocol launches can move entire category prices instantly.',
  },
  'layer-2': { title: 'Layer 2 Coin Prices | Arbitrum, Optimism, Polygon Tracker',
    description: 'Live prices for Ethereum Layer 2 tokens: Arbitrum, Optimism, Polygon, and more. Real-time tracking and alerts.',
    h1: 'Layer 2 Tokens',
    h2: 'Top Layer 2 Tokens by Market Cap',
    intro: 'Layer 2 tokens power the scaling solutions that make Ethereum faster and cheaper while inheriting its security. Arbitrum, Optimism, Polygon, and other Layer 2 networks reduce transaction fees from dollars to cents and settlement times from minutes to seconds. Track real-time prices for Ethereum scaling tokens on Trade Potion. Layer 2 protocols derive value from transaction volume, adoption by major dApps, and governance rights. As more DeFi and NFT activity migrates to Layer 2 to reduce costs, token prices reflect the growing ecosystem value.',
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
    intro: 'Meme coins are community-driven tokens that often start as jokes but have evolved into serious trading assets with billions in market cap. Dogecoin and Shiba Inu proved that internet culture and social media momentum can create genuine financial value. Track live prices for Dogecoin, Shiba Inu, Pepe, and thousands of meme tokens on Trade Potion. Meme coins thrive on viral moments and community engagement — their prices can move 10x based on a trending tweet or celebrity mention. Use our alerts to catch significant moves before they peak.',
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
    intro: 'AI crypto tokens power decentralized machine learning networks, data marketplaces, and AI-driven infrastructure. Render, Fetch.ai, Akash, and other AI tokens enable distributed computing for training models, inference, and autonomous agent networks. Track live AI token prices on Trade Potion as the intersection of blockchain and artificial intelligence accelerates. These tokens capture value from GPU rental markets, data contribution, and computational services. The AI crypto sector is nascent but rapidly expanding as enterprises and researchers seek decentralized alternatives to centralized cloud AI providers.',
  },
  'liquid-staking': { title: 'Liquid Staking Token Prices | stETH, rETH, mSOL Tracker',
    description: 'Track live prices for liquid staking tokens: stETH, rETH, mSOL, and more. Real-time LST market data.',
    h1: 'Liquid Staking Tokens',
    h2: 'Top Liquid Staking Tokens by Market Cap',
    intro: 'Liquid staking tokens (LSTs) like stETH and rETH let you earn Ethereum staking rewards while keeping your capital liquid to trade or use in DeFi. Instead of locking your ETH for 6+ months earning rewards passively, liquid staking derivatives represent your staked position and earn rewards in real-time. Track liquid staking token prices on Trade Potion. As Ethereum staking grows and DeFi applications stack rewards, LST liquidity and utility increase. Smart contract risk, slashing risk, and protocol governance affect LST value and trading dynamics.',
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
  const h1 = meta?.h1 ?? category?.name ?? params.slug.replace(/-/g, ' ');
  const h2 = meta?.h2 ?? `Top ${h1} by Market Cap`;
  const intro = meta?.intro ?? null;

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
              { '@type': 'ListItem', position: 2, name: h1, item: `https://tradepotion.com/category/${params.slug}` },
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">{h1}</h1>
        {category && (
          <div className="flex items-center gap-4 mt-2 text-sm text-zinc-400">
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
      </div>

      {/* Category intro text — populated from Emma's copy */}
      {intro && (
        <p className="text-sm text-zinc-400 leading-relaxed mb-6 max-w-3xl">
          {intro}
        </p>
      )}

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
              <p className="px-4 py-8 text-sm text-zinc-500 text-center">
                {coinsResult.status === 'rejected'
                  ? 'Price data temporarily unavailable — please try again shortly.'
                  : 'No coins found for this category.'}
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
