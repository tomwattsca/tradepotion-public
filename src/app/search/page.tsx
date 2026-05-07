import { Metadata } from 'next';
import { Suspense } from 'react';
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
    <Suspense>
      <SearchClient />
    </Suspense>
  );
}
