import { getCategories, getCoinsByCategory } from '@/lib/coingecko';
import CoinRow from '@/components/CoinRow';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { formatMarketCap, formatPct, pctColor } from '@/lib/utils';

export const revalidate = 300;

const CATEGORY_META: Record<string, { title: string; description: string; h1: string }> = {
  defi: {
    title: 'DeFi Tokens Price Tracker | Top DeFi Cryptocurrency Prices | Trade Potion',
    description: 'Track prices for 500+ DeFi tokens including Aave, Uniswap, Curve. Live DeFi coin prices, charts, and alerts.',
    h1: 'DeFi Tokens — Live Prices & Price Alerts',
  },
  'layer-2': {
    title: 'Layer 2 Coin Prices | Arbitrum, Optimism, Polygon Tracker | Trade Potion',
    description: 'Live prices for Ethereum Layer 2 tokens: Arbitrum, Optimism, Polygon, and more. Real-time tracking and alerts.',
    h1: 'Layer 2 Tokens — Ethereum Scaling Solutions',
  },
  'meme-token': {
    title: 'Meme Coin Prices | Doge, Shiba, Pepe Tracker | Trade Potion',
    description: 'Track live prices for meme coins: Dogecoin, Shiba Inu, Pepe, and 1000+ more. Real-time meme token prices.',
    h1: 'Meme Coins — Community & Trending Tokens',
  },
  'stablecoins': {
    title: 'Stablecoin Prices | USDT, USDC, DAI Tracker | Trade Potion',
    description: 'Track live prices for stablecoins: Tether, USDC, DAI, and more. Monitor USD-pegged token prices and market cap.',
    h1: 'Stablecoins — USD-Pegged Token Tracker',
  },
  'layer-1': {
    title: 'Layer 1 Blockchain Prices | BTC, ETH, SOL Tracker | Trade Potion',
    description: 'Live prices for Layer 1 blockchain tokens: Bitcoin, Ethereum, Solana, Avalanche, and more.',
    h1: 'Layer 1 Blockchains — Live Prices & Market Data',
  },
};

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const meta = CATEGORY_META[params.slug];
  const displayName = meta?.h1 ?? params.slug.replace(/-/g, ' ');
  const title = meta?.title ?? `${displayName} Coin Prices | Trade Potion`;
  const description = meta?.description ?? `Live prices for ${displayName} tokens. Real-time tracking and price alerts on Trade Potion.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://tradepotion.com/category/${params.slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}



interface Props {
  params: { slug: string };
}

export default async function CategoryPage({ params }: Props) {
  const [categories, coins] = await Promise.all([
    getCategories(),
    getCoinsByCategory(params.slug, 50),
  ]);

  const category = categories.find((c) => c.id === params.slug);
  if (!category && coins.length === 0) notFound();

  const displayName = category?.name ?? params.slug.replace(/-/g, ' ');

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Markets
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white capitalize">{displayName}</h1>
        {category && (
          <div className="flex items-center gap-4 mt-2 text-sm text-zinc-400">
            <span>Market cap: <strong className="text-white">{formatMarketCap(category.market_cap)}</strong></span>
            {category.market_cap_change_24h !== undefined && (
              <span className={pctColor(category.market_cap_change_24h)}>
                {formatPct(category.market_cap_change_24h)} (24h)
              </span>
            )}
          </div>
        )}
      </div>

      <div className="rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden">
        <div className="divide-y divide-zinc-800/50">
          {coins.map((coin, i) => (
            <CoinRow key={coin.id} coin={coin} rank={i + 1} />
          ))}
          {coins.length === 0 && (
            <p className="px-4 py-8 text-sm text-zinc-500 text-center">No coins found for this category.</p>
          )}
        </div>
      </div>
    </main>
  );
}
