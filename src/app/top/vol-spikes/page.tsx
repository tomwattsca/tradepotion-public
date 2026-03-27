import Link from 'next/link';
import { ArrowLeft, Zap } from 'lucide-react';
import { Metadata } from 'next';
import VolSpikesClient from '@/components/VolSpikesClient';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Crypto Volume Spikes — Coins With Unusual Trading Activity',
  description: 'Live list of cryptocurrencies with the highest volume-to-market-cap ratio — a leading signal for momentum, news-driven moves, and potential breakouts.',
  openGraph: {
    title: 'Crypto Volume Spikes — Unusual Trading Activity Scanner',
    description: 'Find coins with unusually high volume relative to market cap — a leading signal for price moves. Unique to Trade Potion.',
    url: 'https://tradepotion.com/top/vol-spikes',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crypto Volume Spikes Scanner',
    description: 'Coins with unusual volume vs market cap — a leading signal for breakouts.',
  },
};

export default function VolSpikesPage() {
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
              { '@type': 'ListItem', position: 2, name: 'Volume Spikes', item: 'https://tradepotion.com/top/vol-spikes' },
            ],
          }),
        }}
      />
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Markets
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <Zap className="h-6 w-6 text-violet-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Volume Spikes</h1>
          <p className="text-sm text-zinc-400">Coins with unusual volume — sorted by Vol/MCap ratio</p>
        </div>
      </div>

      <VolSpikesClient />
    </main>
  );
}
