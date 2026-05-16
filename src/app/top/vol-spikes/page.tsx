import Link from 'next/link';
import { ArrowLeft, Bell, Search, Star, Zap } from 'lucide-react';
import { Metadata } from 'next';
import VolSpikesClient from '@/components/VolSpikesClient';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Crypto Volume Spikes — Coins With Unusual Trading Activity',
  description: 'Live list of cryptocurrencies with unusually high trading volume relative to market cap. Use Trade Potion to research activity spikes with neutral market data and price alerts.',
  alternates: { canonical: 'https://tradepotion.com/top/vol-spikes' },
  openGraph: {
    title: 'Crypto Volume Spikes — Unusual Trading Activity Scanner',
    description: 'Find coins with unusually high trading volume relative to market cap, then research the move with neutral market data and price alerts.',
    url: 'https://tradepotion.com/top/vol-spikes',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crypto Volume Spikes Scanner',
    description: 'Coins with unusual volume vs market cap, with neutral market data and no financial-advice framing.',
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
            '@graph': [
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Markets', item: 'https://tradepotion.com' },
                  { '@type': 'ListItem', position: 2, name: 'Volume Spikes', item: 'https://tradepotion.com/top/vol-spikes' },
                ],
              },
              {
                '@type': 'WebPage',
                '@id': 'https://tradepotion.com/top/vol-spikes#webpage',
                url: 'https://tradepotion.com/top/vol-spikes',
                name: 'Crypto Volume Spikes',
                description: 'Neutral cryptocurrency market data for coins with unusual trading volume relative to market cap.',
                isPartOf: { '@id': 'https://tradepotion.com/#website' },
                about: 'Cryptocurrency market data and volume-to-market-cap research',
              },
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
          <p className="text-sm text-zinc-400">Coins with unusual trading volume — sorted by Vol/MCap ratio for research, not recommendations</p>
        </div>
      </div>

      <section className="mb-6 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4 text-sm text-zinc-300">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <h2 className="text-base font-semibold text-white">How to use the volume spike scanner</h2>
            <p className="mt-2">
              High volume relative to market cap can point to news, listings, liquidity changes, or short-term speculation.
              Treat this as a research queue: open the coin page, compare live price, market cap, and volume context,
              and set a price alert before making any decision elsewhere.
            </p>
            <p className="mt-2 text-xs text-zinc-500">Trade Potion provides market data and alert tools only; this is not financial advice.</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
            <Link
              href="/search"
              data-event="price_alert_click"
              data-cta-location="top_vol_spikes_context"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
            >
              <Bell className="h-4 w-4" /> Find a coin to set an alert
            </Link>
            <Link
              href="/watchlist"
              data-event="internal_link_click"
              data-cta-location="top_vol_spikes_context_watchlist"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
            >
              <Star className="h-3.5 w-3.5" /> Watchlist
            </Link>
            <Link
              href="/search"
              data-event="internal_link_click"
              data-cta-location="top_vol_spikes_context_search"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
            >
              <Search className="h-3.5 w-3.5" /> Search coins
            </Link>
          </div>
        </div>
      </section>

      <VolSpikesClient />
    </main>
  );
}
