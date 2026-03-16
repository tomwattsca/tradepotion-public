import { getCoinDetail } from '@/lib/coingecko';
import { formatPrice, formatMarketCap, formatPct, pctColor } from '@/lib/utils';
import PriceChart from '@/components/PriceChart';
import ExchangeCTAs from '@/components/ExchangeCTAs';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';

export const revalidate = 60;

interface Props {
  params: { slug: string };
}

export default async function CoinPage({ params }: Props) {
  let coin;
  try {
    coin = await getCoinDetail(params.slug);
  } catch {
    notFound();
  }

  const md = coin.market_data;
  const price = md.current_price.usd;
  const pct24h = md.price_change_percentage_24h ?? coin.price_change_percentage_24h ?? 0;
  const pct7d = md.price_change_percentage_7d;
  const pct30d = md.price_change_percentage_30d;

  const stats = [
    { label: 'Market Cap', value: formatMarketCap(md.market_cap.usd) },
    { label: '24h Volume', value: formatMarketCap(md.total_volume.usd) },
    { label: 'Circulating Supply', value: md.circulating_supply?.toLocaleString() ?? '—' },
    { label: 'Total Supply', value: md.total_supply?.toLocaleString() ?? '∞' },
    { label: 'All-Time High', value: formatPrice(md.ath.usd) },
    { label: 'All-Time Low', value: formatPrice(md.atl.usd) },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Back */}
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Markets
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Image
          src={coin.image}
          alt={coin.name}
          width={48}
          height={48}
          className="rounded-full"
        />
        <div>
          <h1 className="text-2xl font-bold text-white">
            {coin.name}{' '}
            <span className="text-zinc-500 font-normal text-base uppercase">{coin.symbol}</span>
          </h1>
          {coin.market_cap_rank && (
            <span className="text-xs text-zinc-500">Rank #{coin.market_cap_rank}</span>
          )}
        </div>
        <div className="ml-auto text-right">
          <p className="text-3xl font-bold text-white">{formatPrice(price)}</p>
          <p className={`text-sm font-medium ${pctColor(pct24h)}`}>
            {formatPct(pct24h)} (24h)
          </p>
        </div>
      </div>

      {/* % changes strip */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: '24h', pct: pct24h },
          { label: '7d', pct: pct7d },
          { label: '30d', pct: pct30d },
        ].map((item) => (
          <div key={item.label} className="rounded-lg bg-zinc-900 border border-zinc-800 p-3 text-center">
            <p className={`text-lg font-semibold ${pctColor(item.pct)}`}>{formatPct(item.pct)}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart — 2 cols */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <PriceChart coinId={coin.id} />

          {/* Stats */}
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
            <h2 className="text-sm font-semibold text-zinc-300 mb-3">Market Stats</h2>
            <div className="grid grid-cols-2 gap-3">
              {stats.map((s) => (
                <div key={s.label} className="rounded-lg bg-zinc-950 p-3">
                  <p className="text-xs text-zinc-500 mb-0.5">{s.label}</p>
                  <p className="text-sm font-medium text-white">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* About */}
          {coin.description?.en && (
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
              <h2 className="text-sm font-semibold text-zinc-300 mb-2">About {coin.name}</h2>
              <p
                className="text-sm text-zinc-400 leading-relaxed line-clamp-6"
                dangerouslySetInnerHTML={{
                  __html: coin.description.en.replace(/<a /g, '<a class="text-violet-400 hover:underline" '),
                }}
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <ExchangeCTAs coinSymbol={coin.symbol} coinName={coin.name} />

          {/* Links */}
          {coin.links?.homepage?.[0] && (
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
              <h3 className="text-sm font-semibold text-zinc-300 mb-2">Links</h3>
              <div className="flex flex-col gap-2 text-sm">
                {coin.links.homepage[0] && (
                  <a
                    href={coin.links.homepage[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-violet-400 hover:text-violet-300"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Website
                  </a>
                )}
                {coin.links.twitter_screen_name && (
                  <a
                    href={`https://twitter.com/${coin.links.twitter_screen_name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-violet-400 hover:text-violet-300"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Twitter
                  </a>
                )}
                {coin.links.subreddit_url && (
                  <a
                    href={coin.links.subreddit_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-violet-400 hover:text-violet-300"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Reddit
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Categories */}
          {coin.categories?.length > 0 && (
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
              <h3 className="text-sm font-semibold text-zinc-300 mb-2">Categories</h3>
              <div className="flex flex-wrap gap-1.5">
                {coin.categories.slice(0, 8).map((cat) => (
                  <span
                    key={cat}
                    className="px-2 py-0.5 rounded text-xs bg-zinc-800 text-zinc-400"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
