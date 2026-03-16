import { getCategories, getCoinsByCategory } from '@/lib/coingecko';
import CoinRow from '@/components/CoinRow';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { formatMarketCap, formatPct, pctColor } from '@/lib/utils';

export const revalidate = 300;

interface Props {
  params: { slug: string };
}

export default async function CategoryPage({ params }: Props) {
  const [categories, coins] = await Promise.all([
    getCategories(),
    getCoinsByCategory(params.slug, 50),
  ]);

  const category = categories.find((c) => c.id === params.slug);
  if (!category && coins.length === 0) notFound();

  const displayName = category?.name ?? params.slug.replace(/-/g, ' ');

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Markets
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white capitalize">{displayName}</h1>
        {category && (
          <div className="flex items-center gap-4 mt-2 text-sm text-zinc-400">
            <span>Market cap: <strong className="text-white">{formatMarketCap(category.market_cap)}</strong></span>
            {category.market_cap_change_24h !== undefined && (
              <span className={pctColor(category.market_cap_change_24h)}>
                {formatPct(category.market_cap_change_24h)} (24h)
              </span>
            )}
          </div>
        )}
      </div>

      <div className="rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden">
        <div className="divide-y divide-zinc-800/50">
          {coins.map((coin, i) => (
            <CoinRow key={coin.id} coin={coin} rank={i + 1} />
          ))}
          {coins.length === 0 && (
            <p className="px-4 py-8 text-sm text-zinc-500 text-center">No coins found for this category.</p>
          )}
        </div>
      </div>
    </main>
  );
}
