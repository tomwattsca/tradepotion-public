import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Metadata } from 'next';
import NewListingsClient from '@/components/NewListingsClient';

export const revalidate = 600;

export const metadata: Metadata = {
  title: 'New Crypto Listings 2026 | Recently Added Coins & Tokens',
  description: 'Discover newly listed cryptocurrencies tracked by Trade Potion. See the latest coins added in the last 30 days sorted by listing date.',
};

export default function NewListingsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Markets
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="h-6 w-6 text-violet-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">New Listings</h1>
          <p className="text-sm text-zinc-400">Cryptocurrencies recently added to Trade Potion — newest first</p>
        </div>
      </div>

      <NewListingsClient />
    </main>
  );
}
