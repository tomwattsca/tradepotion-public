export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { Metadata } from 'next';
import GainersClient from '@/components/GainersClient';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Top Crypto Gainers Today | 1H, 24H, 7D Best Performing Coins',
  description: 'Live list of the top cryptocurrency gainers filterable by 1H, 24H, and 7D performance and market cap tier. See which altcoins are pumping right now on Trade Potion.',
};

export default function TopGainersPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Markets
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="h-6 w-6 text-emerald-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Top Crypto Gainers</h1>
          <p className="text-sm text-zinc-400">Best performing coins — filter by time range, volume, and market cap</p>
        </div>
      </div>

      <GainersClient mode="gainers" />
    </main>
  );
}
