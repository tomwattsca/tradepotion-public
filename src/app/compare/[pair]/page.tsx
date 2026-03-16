import { getCoinDetail } from '@/lib/coingecko';
import { formatPrice, formatMarketCap, formatPct, pctColor } from '@/lib/utils';
import PriceChart from '@/components/PriceChart';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';

export const revalidate = 300;

interface Props {
  params: { pair: string };
}

function parsePair(pair: string): [string, string] | null {
  const match = pair.match(/^(.+)-vs-(.+)$/);
  if (!match) return null;
  return [match[1], match[2]];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ids = parsePair(params.pair);
  if (!ids) return { title: 'Compare Coins' };
  const [a, b] = ids.map(id => id.charAt(0).toUpperCase() + id.slice(1));
  return {
    title: `${a} vs ${b} — Price Comparison`,
    description: `Compare ${a} and ${b} side by side. Live prices, market cap, volume, 24h/7d/30d performance charts.`,
  };
}

function StatRow({ label, aVal, bVal, }: {
  label: string;
  aVal: string;
  bVal: string;
  aRaw?: number;
  bRaw?: number;

}) {
  return (
    <div className="grid grid-cols-3 gap-2 py-2.5 border-b border-zinc-800/50 text-sm">
      <span className="text-zinc-400">{label}</span>
      <span className="text-white font-medium text-right">{aVal}</span>
      <span className="text-white font-medium text-right">{bVal}</span>
    </div>
  );
}

export default async function ComparePage({ params }: Props) {
  const ids = parsePair(params.pair);
  if (!ids) notFound();

  const [coinAResult, coinBResult] = await Promise.allSettled([
    getCoinDetail(ids[0]),
    getCoinDetail(ids[1]),
  ]);

  if (coinAResult.status === 'rejected' || coinBResult.status === 'rejected') {
    notFound();
  }

  const a = coinAResult.value;
  const b = coinBResult.value;
  const amd = a.market_data;
  const bmd = b.market_data;

  const stats = [
    {
      label: 'Price (USD)',
      aVal: formatPrice(amd.current_price.usd),
      bVal: formatPrice(bmd.current_price.usd),
    },
    {
      label: '24h Change',
      aVal: formatPct(amd.price_change_percentage_24h ?? 0),
      bVal: formatPct(bmd.price_change_percentage_24h ?? 0),
    },
    {
      label: '7d Change',
      aVal: formatPct(amd.price_change_percentage_7d),
      bVal: formatPct(bmd.price_change_percentage_7d),
    },
    {
      label: '30d Change',
      aVal: formatPct(amd.price_change_percentage_30d),
      bVal: formatPct(bmd.price_change_percentage_30d),
    },
    {
      label: 'Market Cap',
      aVal: formatMarketCap(amd.market_cap.usd),
      bVal: formatMarketCap(bmd.market_cap.usd),
    },
    {
      label: '24h Volume',
      aVal: formatMarketCap(amd.total_volume.usd),
      bVal: formatMarketCap(bmd.total_volume.usd),
    },
    {
      label: 'Circulating Supply',
      aVal: amd.circulating_supply?.toLocaleString() ?? '—',
      bVal: bmd.circulating_supply?.toLocaleString() ?? '—',
    },
    {
      label: 'All-Time High',
      aVal: formatPrice(amd.ath.usd),
      bVal: formatPrice(bmd.ath.usd),
    },
    {
      label: 'All-Time Low',
      aVal: formatPrice(amd.atl.usd),
      bVal: formatPrice(bmd.atl.usd),
    },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Markets
      </Link>

      {/* Header */}
      <div className="flex items-center justify-center gap-6 mb-8">
        <Link href={`/coins/${a.id}`} className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity">
          <Image src={a.image} alt={a.name} width={56} height={56} className="rounded-full" />
          <div className="text-center">
            <p className="font-bold text-white text-lg">{a.name}</p>
            <p className="text-xs text-zinc-500 uppercase">{a.symbol}</p>
          </div>
          <p className="text-2xl font-bold text-white">{formatPrice(amd.current_price.usd)}</p>
          <p className={`text-sm font-medium ${pctColor(amd.price_change_percentage_24h ?? 0)}`}>
            {formatPct(amd.price_change_percentage_24h ?? 0)} (24h)
          </p>
        </Link>

        <div className="text-2xl font-bold text-zinc-600">VS</div>

        <Link href={`/coins/${b.id}`} className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity">
          <Image src={b.image} alt={b.name} width={56} height={56} className="rounded-full" />
          <div className="text-center">
            <p className="font-bold text-white text-lg">{b.name}</p>
            <p className="text-xs text-zinc-500 uppercase">{b.symbol}</p>
          </div>
          <p className="text-2xl font-bold text-white">{formatPrice(bmd.current_price.usd)}</p>
          <p className={`text-sm font-medium ${pctColor(bmd.price_change_percentage_24h ?? 0)}`}>
            {formatPct(bmd.price_change_percentage_24h ?? 0)} (24h)
          </p>
        </Link>
      </div>

      {/* Charts side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <p className="text-sm font-semibold text-zinc-300 mb-2">{a.name} Price Chart</p>
          <PriceChart coinId={a.id} />
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-300 mb-2">{b.name} Price Chart</p>
          <PriceChart coinId={b.id} />
        </div>
      </div>

      {/* Stats table */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
        <div className="grid grid-cols-3 gap-2 pb-2 border-b border-zinc-700 text-xs font-semibold text-zinc-400 uppercase tracking-wide">
          <span></span>
          <span className="text-right flex items-center justify-end gap-1.5">
            <Image src={a.image} alt={a.name} width={16} height={16} className="rounded-full" />
            {a.symbol.toUpperCase()}
          </span>
          <span className="text-right flex items-center justify-end gap-1.5">
            <Image src={b.image} alt={b.name} width={16} height={16} className="rounded-full" />
            {b.symbol.toUpperCase()}
          </span>
        </div>
        {stats.map(s => (
          <StatRow key={s.label} {...s} />
        ))}
      </div>

      {/* SEO content */}
      <div className="mt-8 rounded-xl bg-zinc-900 border border-zinc-800 p-5">
        <h2 className="text-base font-semibold text-white mb-3">{a.name} vs {b.name} — Which Should You Track?</h2>
        <p className="text-sm text-zinc-400 leading-relaxed">
          {a.name} ({a.symbol.toUpperCase()}) is currently trading at {formatPrice(amd.current_price.usd)},
          while {b.name} ({b.symbol.toUpperCase()}) is at {formatPrice(bmd.current_price.usd)}.
          {' '}{a.name}&apos;s market cap of {formatMarketCap(amd.market_cap.usd)} compares to {b.name}&apos;s {formatMarketCap(bmd.market_cap.usd)}.
          Use the charts above to compare price history, and set a price alert on either coin to track movements.
        </p>
        <div className="flex gap-3 mt-4">
          <Link href={`/coins/${a.id}`} className="text-sm text-violet-400 hover:text-violet-300">
            View {a.name} details →
          </Link>
          <Link href={`/coins/${b.id}`} className="text-sm text-violet-400 hover:text-violet-300">
            View {b.name} details →
          </Link>
        </div>
      </div>
    </main>
  );
}
