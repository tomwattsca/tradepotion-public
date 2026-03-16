import { getTopCoins } from '@/lib/coingecko';
import Link from 'next/link';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { Metadata } from 'next';
import TierFilter from '@/components/TierFilter';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Top Crypto Gainers Today | 24h Best Performing Coins',
  description: 'Live list of the top cryptocurrency gainers in the last 24 hours, filterable by market cap tier. See which altcoins are pumping right now on Trade Potion.',
};

export default async function TopGainersPage() {
  let gainers: import('@/types').Coin[] = [];
  let error = false;
  try {
    // Fetch top 250 by market cap, then sort/filter client-side in TierFilter
    const all = await getTopCoins(250);
    gainers = all
      .filter((c) => typeof c.price_change_percentage_24h === 'number' && c.price_change_percentage_24h > 0)
      .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
  } catch {
    error = true;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Markets
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="h-6 w-6 text-emerald-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Top Crypto Gainers</h1>
          <p className="text-sm text-zinc-400">Best performing coins in the last 24 hours</p>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 px-6 py-10 text-center">
          <p className="text-zinc-400 text-sm">Price data temporarily unavailable — try refreshing in a moment.</p>
        </div>
      ) : (
        <TierFilter coins={gainers} />
      )}
    </main>
  );
}
