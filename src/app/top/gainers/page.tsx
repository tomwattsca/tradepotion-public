export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { Metadata } from 'next';
import GainersClient from '@/components/GainersClient';
import TopListContextPanel from '@/components/TopListContextPanel';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Largest Upward Crypto Market Moves Today',
  description: 'Informational market-snapshot list of cryptocurrency upward movers filterable by 1H, 24H, 7D change, volume, and market cap tier. Use Trade Potion to research observed moves and set market alerts.',
  alternates: { canonical: 'https://tradepotion.com/top/gainers' },
  openGraph: {
    title: 'Largest Upward Market Moves',
    description: 'Largest upward movers from market snapshots filtered by 1H, 24H, and 7D change, with volume and market-cap context plus alert and watchlist handoffs.',
    url: 'https://tradepotion.com/top/gainers',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Largest Upward Market Moves',
    description: 'Largest upward market-snapshot movers filtered by 1H, 24H, and 7D. Powered by Trade Potion.',
  },
};

export default function TopGainersPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Markets', item: 'https://tradepotion.com' },
              { '@type': 'ListItem', position: 2, name: 'Largest Upward Market Moves', item: 'https://tradepotion.com/top/gainers' },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Largest Upward Market Moves',
            url: 'https://tradepotion.com/top/gainers',
            description: 'Informational market-snapshot list of crypto upward movers filtered by timeframe, volume, and market-cap tier using CoinGecko market data.',
            isPartOf: { '@type': 'WebSite', name: 'Trade Potion', url: 'https://tradepotion.com' },
            about: 'Cryptocurrency market data',
          }),
        }}
      />
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Markets
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="h-6 w-6 text-emerald-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Largest Upward Market Moves</h1>
          <p className="text-sm text-zinc-400">Research observed upward moves by timeframe, volume, and market cap — informational only</p>
        </div>
      </div>

      <TopListContextPanel kind="gainers" />

      <GainersClient mode="gainers" />
    </main>
  );
}
