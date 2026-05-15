import Link from 'next/link';
import { Bell, Search, ShieldCheck, Star } from 'lucide-react';

type TopListKind = 'gainers' | 'losers' | 'trending' | 'new-listings';

const COPY: Record<TopListKind, {
  label: string;
  description: string;
  ctaLocation: string;
  accent: string;
}> = {
  gainers: {
    label: 'How to use the gainers list',
    description: 'Filter large moves by timeframe, volume and market-cap tier, then open a coin page to review market context before setting any alert.',
    ctaLocation: 'top_gainers_context',
    accent: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
  },
  losers: {
    label: 'How to use the losers list',
    description: 'Use downside moves as a research queue, not a signal. Check liquidity, recent context and longer-term price history on the coin page before setting alerts.',
    ctaLocation: 'top_losers_context',
    accent: 'text-red-300 bg-red-500/10 border-red-500/20',
  },
  trending: {
    label: 'How to use trending coins',
    description: 'Trending rank reflects attention and search interest. Pair it with price, volume and market-cap context before adding anything to a watchlist.',
    ctaLocation: 'top_trending_context',
    accent: 'text-orange-300 bg-orange-500/10 border-orange-500/20',
  },
  'new-listings': {
    label: 'How to use new listings',
    description: 'Newly tracked coins can be volatile and thinly traded. Treat this as a discovery list, then verify liquidity and source data on the coin page.',
    ctaLocation: 'top_new_listings_context',
    accent: 'text-violet-300 bg-violet-500/10 border-violet-500/20',
  },
};

export default function TopListContextPanel({ kind }: { kind: TopListKind }) {
  const copy = COPY[kind];

  return (
    <section className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-lg shadow-black/20" aria-label={copy.label}>
      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr] md:items-center">
        <div>
          <div className={`mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${copy.accent}`}>
            <ShieldCheck className="h-3.5 w-3.5" /> Informational market data
          </div>
          <h2 className="text-lg font-semibold text-white">{copy.label}</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {copy.description} Crypto data is via CoinGecko and can move quickly; Trade Potion is not financial advice.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-1">
          <Link
            href="/search"
            data-event="price_alert_click"
            data-cta-location={copy.ctaLocation}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
          >
            <Bell className="h-4 w-4" /> Find a coin to set an alert
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/watchlist"
              data-event="internal_link_click"
              data-cta-location={`${copy.ctaLocation}_watchlist`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
            >
              <Star className="h-3.5 w-3.5" /> Watchlist
            </Link>
            <Link
              href="/search"
              data-event="internal_link_click"
              data-cta-location={`${copy.ctaLocation}_search`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
            >
              <Search className="h-3.5 w-3.5" /> Search coins
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
