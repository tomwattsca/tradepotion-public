export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { ArrowLeft, TrendingDown } from 'lucide-react';
import { Metadata } from 'next';
import GainersClient from '@/components/GainersClient';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Top Crypto Losers Today | 1H, 24H, 7D Worst Performing Coins',
  description: 'Live list of the top cryptocurrency losers filterable by 1H, 24H, and 7D performance and market cap tier. Track which coins are down the most on Trade Potion.',
  openGraph: {
    title: 'Top Crypto Losers Today',
    description: 'Worst performing coins filtered by 1H, 24H, 7D — with volume and market cap tier filters.',
    url: 'https://tradepotion.com/top/losers',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Top Crypto Losers Today',
    description: 'Worst performing coins filtered by 1H, 24H, 7D. Powered by Trade Potion.',
  },
};

export default function TopLosersPage() {
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
              { '@type': 'ListItem', position: 2, name: 'Top Crypto Losers', item: 'https://tradepotion.com/top/losers' },
            ],
          }),
        }}
      />
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Markets
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <TrendingDown className="h-6 w-6 text-red-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Top Crypto Losers</h1>
          <p className="text-sm text-zinc-400">Worst performing coins — filter by time range, volume, and market cap</p>
        </div>
      </div>

      <GainersClient mode="losers" />
    </main>
  );
}
