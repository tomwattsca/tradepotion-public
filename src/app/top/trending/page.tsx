import Link from 'next/link';
import { ArrowLeft, Flame } from 'lucide-react';
import { Metadata } from 'next';
import TrendingClient from '@/components/TrendingClient';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Trending Crypto Coins Right Now | Most Searched & Popular Tokens',
  description: 'See which cryptocurrencies are trending right now based on search volume and community interest. Live trending coins updated every 5 minutes on Trade Potion.',
  openGraph: {
    title: 'Trending Crypto Coins Right Now',
    description: 'The most searched and discussed cryptocurrencies right now — updated every 5 minutes.',
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
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Markets
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <Flame className="h-6 w-6 text-orange-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Trending Coins</h1>
          <p className="text-sm text-zinc-400">Most searched and community-hyped cryptocurrencies right now</p>
        </div>
      </div>

      <TrendingClient />
    </main>
  );
}
