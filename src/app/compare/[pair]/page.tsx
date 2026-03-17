import { getCoinDetail } from '@/lib/coingecko';
import { formatPrice, formatMarketCap, formatPct, pctColor } from '@/lib/utils';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Metadata } from 'next';
import ShareCompareButton from '@/components/ShareCompareButton';
import CoinCompareSelector from '@/components/CoinCompareSelector';

import dynamicImport from 'next/dynamic';

const NormalisedChartDynamic = dynamicImport(
  () => import('@/components/NormalisedChart'),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse rounded-xl bg-zinc-900/60 border border-zinc-800" style={{ height: '320px' }}>
        <div className="flex items-end justify-around h-full px-4 pb-8 gap-1">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="bg-zinc-800 rounded-t w-full" style={{ height: `${30 + Math.sin(i * 0.4) * 20 + Math.cos(i * 0.7) * 15}%` }} />
          ))}
        </div>
      </div>
    ),
  }
);

// Curated pairs list — used for related comparisons grid (not pre-rendered at build time)
// Pre-rendering 50 pairs simultaneously at build exhausts CoinGecko free tier rate limits
const TOP_STATIC_PAIRS = [
  'bitcoin-vs-ethereum', 'bitcoin-vs-solana', 'bitcoin-vs-dogecoin', 'bitcoin-vs-ripple',
  'bitcoin-vs-litecoin', 'bitcoin-vs-cardano', 'bitcoin-vs-avalanche', 'bitcoin-vs-bnb',
  'bitcoin-vs-polkadot', 'bitcoin-vs-chainlink', 'bitcoin-vs-near', 'bitcoin-vs-sui',
  'ethereum-vs-solana', 'ethereum-vs-bnb', 'ethereum-vs-cardano', 'ethereum-vs-avalanche',
  'ethereum-vs-polygon', 'ethereum-vs-dogecoin', 'ethereum-vs-ripple', 'ethereum-vs-arbitrum',
  'ethereum-vs-shiba-inu', 'ethereum-vs-polkadot', 'ethereum-vs-chainlink', 'ethereum-vs-uniswap',
  'ethereum-vs-near', 'ethereum-vs-sui',
  'solana-vs-avalanche', 'solana-vs-cardano', 'solana-vs-polygon', 'solana-vs-bnb',
  'solana-vs-ripple', 'solana-vs-dogecoin', 'solana-vs-polkadot', 'solana-vs-chainlink',
  'bnb-vs-cardano', 'bnb-vs-avalanche', 'bnb-vs-ripple',
  'ripple-vs-cardano', 'ripple-vs-dogecoin', 'ripple-vs-litecoin',
  'cardano-vs-avalanche', 'cardano-vs-polygon',
  'dogecoin-vs-shiba-inu', 'dogecoin-vs-pepe',
  'shiba-inu-vs-pepe',
  'avalanche-vs-polygon', 'avalanche-vs-chainlink',
  'polygon-vs-arbitrum', 'polygon-vs-chainlink',
];

// Render on demand (not at build time) to avoid simultaneous CoinGecko rate-limit exhaustion
export const dynamic = 'force-dynamic';



const COMPARE_INTROS: Record<string, string> = {
  'bitcoin-vs-ethereum': 'Bitcoin is the original proof-of-work blockchain, while Ethereum enables smart contracts and decentralized applications. Use the normalised chart to compare price performance and correlation over your chosen time frame.',
  'solana-vs-ethereum': 'Both are smart contract platforms, but Solana prioritizes speed and low fees while Ethereum optimizes for decentralization and security. Track their performance correlation and price movements side by side.',
  'bitcoin-vs-solana': 'Bitcoin is a proof-of-work settlement layer; Solana is a high-speed proof-of-stake smart contract platform. Compare these fundamentally different blockchain architectures and their market valuations.',
  'cardano-vs-ethereum': 'Cardano uses peer-reviewed research for protocol upgrades; Ethereum prioritizes rapid iteration and DeFi ecosystem. See how these different development philosophies affect token prices.',
  'ripple-vs-ethereum': 'Ripple focuses on cross-border payments and enterprise adoption; Ethereum is the DeFi and smart contracts leader. Compare their market performance and adoption drivers.',
  'dogecoin-vs-shiba-inu': 'Both meme coins with cult followings, but Doge has 13+ year brand recognition while Shiba Inu launched in 2020 with DeFi utility. Track how social hype and community engagement drive their prices.',
  'polygon-vs-arbitrum': 'Both are Ethereum Layer 2 scaling solutions, but Polygon also has standalone sidechain components while Arbitrum is pure optimistic rollup. Compare their ecosystem growth and token performance.',
  'chainlink-vs-uniswap': 'Chainlink provides oracle data for smart contracts; Uniswap is a decentralized exchange. Compare two critical DeFi infrastructure tokens and their correlation.',
  'ethereum-vs-solana': 'Both are smart contract platforms, but Solana prioritizes speed and low fees while Ethereum optimizes for decentralization and security. Track their performance correlation and price movements side by side.',
  "bitcoin-vs-dogecoin": "Bitcoin is institutional-grade digital money; Dogecoin is a community-driven meme coin. Compare the world's most valuable cryptocurrency with a culture-driven alt coin.",
};


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
  const title = `${a} vs ${b} Price Comparison | Trade Potion`;
  const description = `Compare ${a} and ${b} side by side. Normalised performance chart, Pearson correlation, price, market cap, volume, ATH and more.`;
  const url = `https://tradepotion.com/compare/${params.pair}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${a} vs ${b} — Which is the better investment?`,
      description,
      url,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${a} vs ${b} — Price Comparison`,
      description,
    },
  };
}

function StatRow({ label, aVal, bVal }: { label: string; aVal: string; bVal: string }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-2.5 border-b border-zinc-800/50 text-sm">
      <span className="text-zinc-400">{label}</span>
      <span className="text-white font-medium text-right">{aVal}</span>
      <span className="text-white font-medium text-right">{bVal}</span>
    </div>
  );
}

function DataUnavailable({ pair }: { pair: string }) {
  const ids = parsePair(pair);
  const label = ids
    ? `${ids[0].charAt(0).toUpperCase() + ids[0].slice(1)} vs ${ids[1].charAt(0).toUpperCase() + ids[1].slice(1)}`
    : 'this pair';

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <AlertTriangle className="h-10 w-10 text-amber-400/70" />
      <div>
        <p className="text-white font-semibold text-lg mb-1">Data temporarily unavailable</p>
        <p className="text-zinc-400 text-sm max-w-xs">
          We couldn{"'"} load price data for {label} right now. This is usually a brief API hiccup — try again in a moment.
        </p>
      </div>
      <div className="flex gap-3 mt-2">
        <Link
          href={`/compare/${pair}`}
          className="px-4 py-2 text-sm bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors"
        >
          Try again
        </Link>
        <Link
          href="/"
          className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
        >
          Back to Markets
        </Link>
      </div>
    </div>
  );
}

async function fetchWithRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < retries) await new Promise(r => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw lastErr;
}

export default async function ComparePage({ params }: Props) {
  const ids = parsePair(params.pair);
  if (!ids) notFound();

  // Stagger fetches to avoid simultaneous CoinGecko rate-limit hits
  const [coinAResult, coinBResult] = await Promise.allSettled([
    fetchWithRetry(() => getCoinDetail(ids[0])),
    new Promise<void>(r => setTimeout(r, 400))
      .then(() => fetchWithRetry(() => getCoinDetail(ids[1]))),
  ]);

  // Graceful degradation: show a friendly error instead of 404ing on API failures
  if (coinAResult.status === 'rejected' || coinBResult.status === 'rejected') {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Markets
          </Link>
        </div>
        <DataUnavailable pair={params.pair} />
      </main>
    );
  }

  const a = coinAResult.value;
  const b = coinBResult.value;
  const amd = a.market_data;
  const bmd = b.market_data;

  const stats: { label: string; aVal: string; bVal: string }[] = [
    { label: 'Price (USD)', aVal: formatPrice(amd.current_price.usd), bVal: formatPrice(bmd.current_price.usd) },
    { label: '24h Change', aVal: formatPct(amd.price_change_percentage_24h ?? 0), bVal: formatPct(bmd.price_change_percentage_24h ?? 0) },
    { label: '7d Change', aVal: formatPct(amd.price_change_percentage_7d), bVal: formatPct(bmd.price_change_percentage_7d) },
    { label: '30d Change', aVal: formatPct(amd.price_change_percentage_30d), bVal: formatPct(bmd.price_change_percentage_30d) },
    { label: 'Market Cap', aVal: formatMarketCap(amd.market_cap.usd), bVal: formatMarketCap(bmd.market_cap.usd) },
    { label: '24h Volume', aVal: formatMarketCap(amd.total_volume.usd), bVal: formatMarketCap(bmd.total_volume.usd) },
    { label: 'Circulating Supply', aVal: amd.circulating_supply?.toLocaleString() ?? '—', bVal: bmd.circulating_supply?.toLocaleString() ?? '—' },
    { label: 'All-Time High', aVal: formatPrice(amd.ath.usd), bVal: formatPrice(bmd.ath.usd) },
    { label: 'All-Time Low', aVal: formatPrice(amd.atl.usd), bVal: formatPrice(bmd.atl.usd) },
  ];

  const shareUrl = `https://tradepotion.com/compare/${params.pair}`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Markets
        </Link>
        <ShareCompareButton url={shareUrl} />
      </div>

      {/* Dynamic coin selector */}
      <CoinCompareSelector currentPair={params.pair} />

      {/* Compare intro text */}
      {params.pair && COMPARE_INTROS[params.pair] && (
        <div className="mb-6 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 text-sm text-zinc-300 leading-relaxed">
          {COMPARE_INTROS[params.pair]}
        </div>
      )}

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

      {/* Normalised overlay chart — the key differentiator */}
      <div className="mb-6">
        <NormalisedChartDynamic
          coinAId={a.id}
          coinAName={a.name}
          coinBId={b.id}
          coinBName={b.name}
        />
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

      {/* Related comparisons — auto-generated from coins in this pair */}
      {(() => {
        // Split related pairs: up to 4 for coin A, up to 4 for coin B — guarantees both coins featured
        const aRelated = TOP_STATIC_PAIRS.filter(p => p !== params.pair && p.includes(a.id)).slice(0, 4);
        const bRelated = TOP_STATIC_PAIRS.filter(p => p !== params.pair && p.includes(b.id) && !aRelated.includes(p)).slice(0, 4);
        const related = [...aRelated, ...bRelated];
        if (related.length === 0) return null;
        return (
          <div className="mt-8 rounded-xl bg-zinc-900/50 border border-zinc-800 p-4">
            <h2 className="text-sm font-semibold text-zinc-400 mb-3">Related Comparisons</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {related.map(pair => {
                const parts = pair.match(/^(.+)-vs-(.+)$/);
                if (!parts) return null;
                const [, pa, pb] = parts;
                const label = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
                return (
                  <Link key={pair} href={`/compare/${pair}`}
                    className="text-xs text-violet-400 hover:text-violet-300 bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-lg transition-colors text-center">
                    {label(pa)} vs {label(pb)}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })()}
    </main>
  );
}
