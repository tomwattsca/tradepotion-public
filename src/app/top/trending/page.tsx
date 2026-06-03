import Link from 'next/link';
import { ArrowLeft, Flame } from 'lucide-react';
import { Metadata } from 'next';
import TrendingClient from '@/components/TrendingClient';
import TopListContextPanel from '@/components/TopListContextPanel';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Trending Crypto Attention Snapshot | Market Context',
  description: 'Review cryptocurrencies receiving elevated CoinGecko attention signals with price, volume, market-cap context, watchlist handoffs, and informational price-alert paths.',
  alternates: { canonical: 'https://tradepotion.com/top/trending' },
  openGraph: {
    title: 'Trending Crypto Attention Snapshot',
    description: 'Cryptocurrencies receiving elevated attention signals, with coin-detail, watchlist, and alert handoffs.',
    url: 'https://tradepotion.com/top/trending',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trending Crypto Attention Snapshot',
    description: 'CoinGecko attention signals with market-cap, volume, and price context. Informational only; not financial advice.',
  },
};

export default function TrendingPage() {
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
              { '@type': 'ListItem', position: 2, name: 'Trending Coins', item: 'https://tradepotion.com/top/trending' },
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
            name: 'Trending Crypto Attention Snapshot',
            url: 'https://tradepotion.com/top/trending',
            description: 'Informational list of cryptocurrencies receiving elevated CoinGecko attention signals with price, volume, and market-cap context.',
            isPartOf: { '@type': 'WebSite', name: 'Trade Potion', url: 'https://tradepotion.com' },
            about: 'Cryptocurrency market data',
          }),
        }}
      />
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Markets
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <Flame className="h-6 w-6 text-orange-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Trending Crypto Attention Snapshot</h1>
          <p className="text-sm text-zinc-400">Coins receiving CoinGecko attention signals — compare price, volume, and market-cap context before acting.</p>
        </div>
      </div>

      <TopListContextPanel kind="trending" />

      <TrendingClient />
    </main>
  );
}
