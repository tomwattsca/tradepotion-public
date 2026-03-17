'use client';

import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';

interface Props {
  coinAId: string;
  coinAName: string;
  coinBId: string;
  coinBName: string;
}

type Range = '7d' | '30d' | '90d' | '1y';

const RANGES: { label: string; value: Range; days: number }[] = [
  { label: '7D', value: '7d', days: 7 },
  { label: '30D', value: '30d', days: 30 },
  { label: '90D', value: '90d', days: 90 },
  { label: '1Y', value: '1y', days: 365 },
];

function formatDate(ts: number, days: number): string {
  const d = new Date(ts);
  if (days <= 7) return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });
  if (days <= 90) return d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
  return d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
}

export default function NormalisedChart({ coinAId, coinAName, coinBId, coinBName }: Props) {
  const [range, setRange] = useState<Range>('30d');
  const [data, setData] = useState<{ ts: number; a: number; b: number; date: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [correlation, setCorrelation] = useState<{ value: number; label: string } | null>(null);

  const days = RANGES.find(r => r.value === range)?.days ?? 30;

  useEffect(() => {
    setLoading(true);
    setError(false);

    // Sequential fetches to avoid simultaneous CoinGecko rate-limit hits
    const fetchJson = async (url: string, retries = 3): Promise<unknown> => {
      for (let i = 0; i <= retries; i++) {
        const res = await fetch(url);
        if (res.ok) return res.json();
        // Back off longer for rate limits
        const delay = res.status === 429 ? 2000 * (i + 1) : 600 * (i + 1);
        if (i < retries) await new Promise(r => setTimeout(r, delay));
      }
      throw new Error('fetch failed after retries');
    };

    (async () => {
      // Sequential: fetch A, then B (500ms gap), then correlation in parallel with B
      const aData = await fetchJson(`/api/chart/${coinAId}?days=${days}`) as { prices?: [number,number][] } | null;
      await new Promise(r => setTimeout(r, 500));
      const [bData, corrData] = await Promise.all([
        fetchJson(`/api/chart/${coinBId}?days=${days}`).catch(() => null) as Promise<{ prices?: [number,number][] } | null>,
        fetch(`/api/correlation?a=${coinAId}&b=${coinBId}&days=${days}`).then(r => r.json()).catch(() => null),
      ]);

      Promise.resolve().then(() => {
        if (!aData?.prices?.length || !bData?.prices?.length) {
          setError(true);
          setLoading(false);
          return;
        }
        const safeA = aData as { prices: [number, number][] };
        const safeB = bData as { prices: [number, number][] };

        const aBase = safeA.prices[0][1];
        const bBase = safeB.prices[0][1];

        // Normalise: (price / basePrice - 1) * 100 = % return from start
        const aNorm = new Map<number, number>();
        safeA.prices.forEach(([ts, p]) => {
          aNorm.set(ts, ((p / aBase) - 1) * 100);
        });

        // Align to coin A's timestamps
        const bPrices = safeB.prices;
        const merged = safeA.prices.map(([ts, ap]) => {
          // Find closest B price
          const bClose = bPrices.reduce((prev, curr) =>
            Math.abs(curr[0] - ts) < Math.abs(prev[0] - ts) ? curr : prev
          );
          return {
            ts,
            date: formatDate(ts, days),
            a: parseFloat(((ap / aBase - 1) * 100).toFixed(2)),
            b: parseFloat(((bClose[1] / bBase - 1) * 100).toFixed(2)),
          };
        });

        // Downsample to ~150 points max for performance
        const step = Math.max(1, Math.floor(merged.length / 150));
        setData(merged.filter((_, i) => i % step === 0 || i === merged.length - 1));

        if (corrData?.correlation != null) {
          setCorrelation({ value: corrData.correlation, label: corrData.label });
        }
        setLoading(false);
      });
    })().catch(() => {
      setError(true);
      setLoading(false);
    });
  }, [coinAId, coinBId, days]);

  const aFinal = data.length > 0 ? data[data.length - 1]?.a : null;
  const bFinal = data.length > 0 ? data[data.length - 1]?.b : null;

  function corrColor(v: number) {
    if (v >= 0.7) return 'text-emerald-400';
    if (v >= 0.4) return 'text-yellow-400';
    if (v >= 0) return 'text-zinc-400';
    if (v >= -0.4) return 'text-orange-400';
    return 'text-red-400';
  }

  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white">Normalised Performance</h3>
          <p className="text-xs text-zinc-500">% return from period start · indexed to 0</p>
        </div>
        <div className="flex items-center gap-2">
          {correlation && (
            <span className={`text-xs font-medium px-2 py-1 rounded-lg bg-zinc-800 ${corrColor(correlation.value)}`}>
              ρ {correlation.value.toFixed(2)} · {correlation.label}
            </span>
          )}
          <div className="flex gap-1">
            {RANGES.map(r => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  range === r.value
                    ? 'bg-violet-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Return labels */}
      {!loading && !error && aFinal !== null && bFinal !== null && (
        <div className="flex gap-4 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-orange-400 inline-block rounded" />
            <span className="text-xs text-zinc-400">{coinAName}</span>
            <span className={`text-xs font-semibold ${aFinal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {aFinal >= 0 ? '+' : ''}{aFinal.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-blue-400 inline-block rounded" />
            <span className="text-xs text-zinc-400">{coinBName}</span>
            <span className={`text-xs font-semibold ${bFinal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {bFinal >= 0 ? '+' : ''}{bFinal.toFixed(2)}%
            </span>
          </div>
        </div>
      )}

      {/* Chart */}
      <div style={{ width: '100%', height: '240px' }}>
        {loading && (
          <div className="space-y-2 h-full flex flex-col justify-between p-4">
            {/* Skeleton bars to simulate chart lines */}
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-0.5 bg-gradient-to-r from-violet-500/20 via-violet-500/50 to-violet-500/20 rounded animate-pulse" style={{ width: `${60 + i * 8}%`, marginLeft: `${i * 5}%` }} />
            ))}
            <div className="flex-1 flex items-center justify-center">
              <span className="text-xs text-zinc-600 animate-pulse">Loading chart...</span>
            </div>
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <p className="text-xs text-zinc-500">Chart data temporarily unavailable</p>
            <button
              onClick={() => { setError(false); setLoading(true); }}
              className="text-xs text-amber-400 hover:text-amber-300 underline"
            >
              Try again
            </button>
          </div>
        )}
        {!loading && !error && data.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <XAxis
                dataKey="date"
                tick={{ fill: '#71717a', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: '#71717a', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `${v > 0 ? '+' : ''}${v.toFixed(0)}%`}
                width={48}
              />
              <ReferenceLine y={0} stroke="#3f3f46" strokeDasharray="4 4" />
              <Tooltip
                contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(v: any, n: any) => [typeof v === 'number' ? `${v > 0 ? '+' : ''}${v.toFixed(2)}%` : '—', String(n)]}
                labelStyle={{ color: '#a1a1aa', marginBottom: 4 }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, color: '#a1a1aa' }}
                formatter={(value) => value === 'a' ? coinAName : coinBName}
              />
              <Line
                type="monotone"
                dataKey="a"
                name="a"
                stroke="#fb923c"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                activeDot={{ r: 4, fill: '#fb923c' }}
              />
              <Line
                type="monotone"
                dataKey="b"
                name="b"
                stroke="#60a5fa"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                activeDot={{ r: 4, fill: '#60a5fa' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
