export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { ArrowLeft, TrendingDown } from 'lucide-react';
import { Metadata } from 'next';
import GainersClient from '@/components/GainersClient';
import TopListContextPanel from '@/components/TopListContextPanel';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Top Crypto Losers Today | 1H, 24H, 7D Worst Performing Coins',
  description: 'Live informational list of the top cryptocurrency losers filterable by 1H, 24H, 7D performance, volume, and market cap tier. Research downside moves and set price alerts from coin pages.',
  alternates: { canonical: 'https://tradepotion.com/top/losers' },
  openGraph: {
    title: 'Top Crypto Losers Today',
    description: 'Downside crypto movers filtered by 1H, 24H, 7D — with volume and market cap tier filters plus watchlist handoffs.',
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Top Crypto Losers Today',
            url: 'https://tradepotion.com/top/losers',
            description: 'Informational list of crypto downside movers filtered by timeframe, volume and market-cap tier using CoinGecko market data.',
            isPartOf: { '@type': 'WebSite', name: 'Trade Potion', url: 'https://tradepotion.com' },
            about: 'Cryptocurrency market data',
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
          <p className="text-sm text-zinc-400">Research downside movers by timeframe, volume, and market cap — informational only</p>
        </div>
      </div>

      <TopListContextPanel kind="losers" />

      <GainersClient mode="losers" />
    </main>
  );
}
