import { getTopGainers } from '@/lib/coingecko';
import CoinRow from '@/components/CoinRow';
import Link from 'next/link';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { Metadata } from 'next';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Top Crypto Gainers Today | 24h Best Performing Coins',
  description: 'Live list of the top cryptocurrency gainers in the last 24 hours. See which altcoins are pumping right now on Trade Potion.',
};

export default async function TopGainersPage() {
  let gainers: import('@/types').Coin[] = [];
  try {
    gainers = await getTopGainers(50);
  } catch {
    // graceful fallback
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

      <div className="rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden">
        <div className="divide-y divide-zinc-800/50">
          {gainers.map((coin, i) => (
            <CoinRow key={coin.id} coin={coin} rank={i + 1} />
          ))}
          {gainers.length === 0 && (
            <p className="px-4 py-8 text-sm text-zinc-500 text-center">Data temporarily unavailable — try again shortly.</p>
          )}
        </div>
      </div>
    </main>
  );
}
