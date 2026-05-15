'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { MarketChartData, TimeRange } from '@/types';
import { formatPrice } from '@/lib/utils';

interface Props {
  coinId: string;
}

interface ChartErrorResponse {
  error?: string;
}

const RANGES: { label: string; value: TimeRange; days: string }[] = [
  { label: '7D', value: '7d', days: '7' },
  { label: '30D', value: '30d', days: '30' },
  { label: '1Y', value: '1y', days: '365' },
];

export default function PriceChart({ coinId }: Props) {
  const [range, setRange] = useState<TimeRange>('7d');
  const [data, setData] = useState<{ time: string; price: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const days = RANGES.find((r) => r.value === range)?.days ?? '7';

    fetch(`/api/chart/${coinId}?days=${days}`)
      .then(async (r) => {
        const json = (await r.json()) as MarketChartData | ChartErrorResponse;
        if (!r.ok || !('prices' in json) || !Array.isArray(json.prices)) {
          throw new Error('Chart data temporarily unavailable');
        }
        return json;
      })
      .then((json: MarketChartData) => {
        if (cancelled) return;
        const points = json.prices
          .filter(([, price]) => Number.isFinite(price))
          .map(([ts, price]) => ({
            time: new Date(ts).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
            price,
          }));
        // Downsample to ~100 points for perf
        const step = Math.max(1, Math.floor(points.length / 100));
        const sampledPoints = points.filter((_, i) => i % step === 0);
        setData(sampledPoints);
        setError(sampledPoints.length < 2 ? 'not_enough_chart_points' : null);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setData([]);
        setError('chart_unavailable');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [coinId, range]);

  const hasChartData = data.length >= 2;
  const isPositive =
    hasChartData ? data[data.length - 1].price >= data[0].price : true;
  const color = isPositive ? '#34d399' : '#f87171';

  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
      {/* Range selector */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-zinc-300">Price Chart</h2>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                range === r.value
                  ? 'bg-violet-600 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-56 flex items-center justify-center" data-chart-state="loading">
          <div className="h-6 w-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !hasChartData ? (
        <div
          className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-950/50 px-4 py-8 text-center"
          data-chart-state={error ?? 'empty'}
          role="status"
          aria-live="polite"
        >
          <p className="text-sm font-medium text-zinc-200">Price chart temporarily unavailable</p>
          <p className="mt-2 max-w-md text-xs leading-relaxed text-zinc-500">
            Historical chart data can be delayed during upstream market-data limits. The live price, market cap,
            24-hour volume, and alert controls on this page remain available for non-advisory research.
          </p>
        </div>
      ) : (
        <div style={{ width: '100%', height: 220 }} data-chart-state="ready">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              tick={{ fill: '#71717a', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fill: '#71717a', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatPrice(v)}
              width={72}
            />
            <Tooltip
              contentStyle={{
                background: '#18181b',
                border: '1px solid #3f3f46',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#fff',
              }}
              formatter={(v) => [formatPrice(v as number), 'Price']}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={color}
              strokeWidth={2}
              fill="url(#priceGrad)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
