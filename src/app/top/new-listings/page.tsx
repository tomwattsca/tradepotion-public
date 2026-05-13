import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Metadata } from 'next';
import NewListingsClient from '@/components/NewListingsClient';
import TopListContextPanel from '@/components/TopListContextPanel';

export const revalidate = 600;

export const metadata: Metadata = {
  title: 'New Crypto Listings 2026 | Recently Added Coins & Tokens',
  description: 'Discover newly tracked cryptocurrencies on Trade Potion. Review recently added coins with source context, market data, watchlists, and price-alert paths.',
  alternates: { canonical: 'https://tradepotion.com/top/new-listings' },
  openGraph: {
    title: 'New Crypto Listings 2026',
    description: 'Recently added cryptocurrencies tracked by Trade Potion, with coin-detail, watchlist, and alert handoffs.',
    url: 'https://tradepotion.com/top/new-listings',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'New Crypto Listings 2026',
    description: 'Recently added cryptocurrencies tracked by Trade Potion.',
  },
};

export default function NewListingsPage() {
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
              { '@type': 'ListItem', position: 2, name: 'New Listings', item: 'https://tradepotion.com/top/new-listings' },
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
            name: 'New Crypto Listings',
            url: 'https://tradepotion.com/top/new-listings',
            description: 'Informational list of cryptocurrencies recently added to Trade Potion tracking, using CoinGecko market data.',
            isPartOf: { '@type': 'WebSite', name: 'Trade Potion', url: 'https://tradepotion.com' },
            about: 'Cryptocurrency market data',
          }),
        }}
      />
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Markets
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="h-6 w-6 text-violet-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">New Listings</h1>
          <p className="text-sm text-zinc-400">Recently tracked coins — verify liquidity and market context before acting</p>
        </div>
      </div>

      <TopListContextPanel kind="new-listings" />

      <NewListingsClient />
    </main>
  );
}
