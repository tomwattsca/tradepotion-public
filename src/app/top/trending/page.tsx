import Link from 'next/link';
import { ArrowLeft, Flame } from 'lucide-react';
import { Metadata } from 'next';
import TrendingClient from '@/components/TrendingClient';
import TopListContextPanel from '@/components/TopListContextPanel';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Trending Crypto Coins Right Now | Most Searched & Popular Tokens',
  description: 'See which cryptocurrencies are trending based on search volume and community interest. Use Trade Potion to review market context, watchlists, and price-alert paths.',
  alternates: { canonical: 'https://tradepotion.com/top/trending' },
  openGraph: {
    title: 'Trending Crypto Coins Right Now',
    description: 'Cryptocurrencies receiving elevated search and community attention, with coin-detail, watchlist, and alert handoffs.',
    url: 'https://tradepotion.com/top/trending',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trending Crypto Coins Right Now',
    description: 'Most searched crypto coins updated every 5 minutes. Powered by Trade Potion.',
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
            name: 'Trending Crypto Coins Right Now',
            url: 'https://tradepotion.com/top/trending',
            description: 'Informational list of cryptocurrencies receiving elevated search and community attention using CoinGecko market data.',
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
          <h1 className="text-2xl font-bold text-white">Trending Coins</h1>
          <p className="text-sm text-zinc-400">Coins receiving search and community attention — verify market context before acting</p>
        </div>
      </div>

      <TopListContextPanel kind="trending" />

      <TrendingClient />
    </main>
  );
}
