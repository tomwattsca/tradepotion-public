import { query } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Zap } from 'lucide-react';
import { formatMarketCap, formatPrice, formatPct, pctColor } from '@/lib/utils';
import type { Metadata } from 'next';

export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Crypto Volume Spikes — Unusual Volume Activity | Trade Potion',
  description: 'Find cryptocurrencies with unusual trading volume today. Coins trading 3x or more above their 30-day average volume — a key signal for traders.',
};

async function getVolumeSpikes() {
  try {
    const rows = await query<{
      id: string; name: string; symbol: string; image_url: string;
      current_price: number; market_cap: number; current_volume: number;
      avg_30d_volume: number | null; spike_ratio: number | null;
      price_change_24h: number; days_of_data: number;
    }>(`
      WITH daily_vol AS (
        SELECT coin_id, DATE(captured_at) AS snap_date, AVG(volume_24h) AS avg_vol_that_day
        FROM price_snapshots GROUP BY coin_id, DATE(captured_at)
      ),
      latest_snap AS (
        SELECT DISTINCT ON (coin_id) coin_id,
          volume_24h AS current_volume, price_usd AS current_price,
          market_cap, price_change_24h
        FROM price_snapshots ORDER BY coin_id, captured_at DESC
      ),
      historical_avg AS (
        SELECT coin_id, AVG(avg_vol_that_day) AS avg_30d_volume,
          COUNT(DISTINCT snap_date) AS days_of_data
        FROM daily_vol WHERE snap_date < CURRENT_DATE GROUP BY coin_id
      )
      SELECT c.id, c.name, c.symbol, c.image_url,
        ls.current_price::float, ls.market_cap::float,
        ls.current_volume::float, ls.price_change_24h::float,
        ha.avg_30d_volume::float,
        ROUND((ls.current_volume / NULLIF(ha.avg_30d_volume, 0))::numeric, 2)::float AS spike_ratio,
        COALESCE(ha.days_of_data, 0)::int AS days_of_data
      FROM latest_snap ls
      JOIN coins c ON c.id = ls.coin_id
      LEFT JOIN historical_avg ha ON ha.coin_id = ls.coin_id
      ORDER BY spike_ratio DESC NULLS LAST, ls.current_volume DESC
      LIMIT 50
    `);
    return rows;
  } catch {
    return [];
  }
}

export default async function VolumeSpilesPage() {
  const coins = await getVolumeSpikes();
  const daysOfData = coins[0]?.days_of_data ?? 0;
  const hasHistorical = daysOfData >= 3;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Markets
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <Zap className="h-6 w-6 text-yellow-400" />
        <h1 className="text-2xl font-bold text-white">Volume Spikes</h1>
      </div>
      <div className="mb-8 rounded-lg bg-zinc-900/50 border border-zinc-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-3">What Are Volume Spikes?</h2>
        <p className="text-sm text-zinc-300 leading-relaxed mb-4">
          Trading volume is one of the most reliable early signals of market moves. When a cryptocurrency suddenly 
          trades 3x, 5x, or 10x its average volume, professional traders know something is happening — a whale buy, 
          a protocol launch, exchange listing, or major news.
        </p>
        <p className="text-sm text-zinc-300 leading-relaxed mb-4">
          Trade Potion{"'"} Volume Spikes page filters the 10,000+ coin market to show only coins where today{"'"} volume 
          is unusually high. The &quot;Spike Ratio&quot; column shows the multiplier: a 3.5x spike means today{"'"} volume 
          is 3.5 times the 30-day average.
        </p>
        <div className="bg-zinc-950/50 rounded p-4 mb-4 border border-zinc-800/50">
          <p className="text-xs font-semibold text-zinc-400 uppercase mb-2">How to Use It</p>
          <p className="text-sm text-zinc-300 leading-relaxed">
            Sort by Spike Ratio (highest first) to find the most unusual activity. Use the 1H/24H/7D tabs to see 
            if the spike is a short burst (1H) or sustained (24H). Cross-reference the 24h % change — spikes without 
            price movement can signal accumulation before a move; spikes with 20%+ gains confirm volume drove price.
          </p>
        </div>
        <div className="bg-zinc-950/50 rounded p-4 border border-zinc-800/50">
          <p className="text-xs font-semibold text-zinc-400 uppercase mb-2">Example</p>
          <p className="text-sm text-zinc-300 leading-relaxed">
            <strong>Bitcoin spikes to 4.2x with +15% in 24h</strong> → institutional buying confirmed by volume and price. 
            <strong> Shiba Inu spikes to 3.8x but 0% price change</strong> → smart money accumulating before expected announcement.
          </p>
        </div>
      </div>

      {!hasHistorical && (
        <div className="rounded-lg bg-yellow-900/20 border border-yellow-700/40 px-4 py-3 text-sm text-yellow-300 mb-6">
          <strong>Building history:</strong> Spike ratios become accurate after 3+ days of data.
          Currently showing coins sorted by raw 24h volume ({daysOfData === 0 ? 'day 1' : `${daysOfData} day${daysOfData !== 1 ? 's' : ''} collected`}).
        </div>
      )}

      <div className="rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3">#</th>
              <th className="text-left px-4 py-3">Coin</th>
              <th className="text-right px-4 py-3">Price</th>
              <th className="text-right px-4 py-3">24h %</th>
              <th className="text-right px-4 py-3">24h Volume</th>
              <th className="text-right px-4 py-3">Avg Volume</th>
              <th className="text-right px-4 py-3">Spike Ratio</th>
            </tr>
          </thead>
          <tbody>
            {coins.map((coin, i) => (
              <tr key={coin.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3 text-zinc-500">{i + 1}</td>
                <td className="px-4 py-3">
                  <Link href={`/coins/${coin.id}`} className="flex items-center gap-2 hover:text-violet-400 transition-colors">
                    {coin.image_url && (
                      <Image src={coin.image_url} alt={coin.name} width={24} height={24} className="rounded-full" />
                    )}
                    <span className="font-medium text-white">{coin.name}</span>
                    <span className="text-zinc-500 uppercase text-xs">{coin.symbol}</span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-right text-white">{formatPrice(coin.current_price)}</td>
                <td className={`px-4 py-3 text-right font-medium ${pctColor(coin.price_change_24h)}`}>
                  {formatPct(coin.price_change_24h)}
                </td>
                <td className="px-4 py-3 text-right text-white">{formatMarketCap(coin.current_volume)}</td>
                <td className="px-4 py-3 text-right text-zinc-400">
                  {coin.avg_30d_volume ? formatMarketCap(coin.avg_30d_volume) : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  {coin.spike_ratio ? (
                    <span className={`font-bold ${coin.spike_ratio >= 3 ? 'text-yellow-400' : coin.spike_ratio >= 2 ? 'text-orange-400' : 'text-zinc-300'}`}>
                      {coin.spike_ratio.toFixed(1)}x
                    </span>
                  ) : (
                    <span className="text-zinc-500">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-zinc-600 mt-4">
        Spike ratio = today&apos;s 24h volume ÷ 30-day average daily volume. Updated every 10 minutes.
      </p>
    </main>
  );
}
