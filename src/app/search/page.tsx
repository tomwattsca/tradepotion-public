import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import SearchClient from './SearchClient';

export const metadata: Metadata = {
  title: 'Search Crypto Prices',
  description: 'Search Trade Potion coin pages by cryptocurrency name or symbol. Use this utility to find live price, market cap, volume, category, and comparison pages.',
  alternates: { canonical: 'https://tradepotion.com/search' },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: 'Search Crypto Prices | Trade Potion',
    description: 'Find Trade Potion coin price and comparison pages by cryptocurrency name or symbol.',
    url: 'https://tradepotion.com/search',
    type: 'website',
  },
};

export default function SearchPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
        data-event="internal_link_click"
        data-cta-location="search_back_markets"
      >
        <ArrowLeft className="h-4 w-4" />
        Markets
      </Link>

      <header className="mb-6">
        <h1 className="mb-3 text-2xl font-bold text-white">Search Crypto Prices</h1>
        <p className="text-sm leading-6 text-zinc-400">
          Find public Trade Potion coin pages by token name or symbol, then review live price, market cap,
          24-hour volume, categories, comparisons, and neutral market context. Search result pages are a
          utility for users and are intentionally kept out of Google&apos;s index.
        </p>
      </header>

      <Suspense fallback={<p className="text-sm text-zinc-500">Loading search utility…</p>}>
        <SearchClient />
      </Suspense>
    </main>
  );
}
