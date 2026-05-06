"use client";

import Link from "next/link";

interface InsightPanelProps {
  coinId: string;
  coinName: string;
  symbol: string;
  /** Current market cap in USD */
  marketCap: number;
  /** Current 24h volume in USD */
  volume24h: number;
  /**
   * 30-day chart data from /coins/{id}/market_chart?days=30
   * market_caps: [timestamp, usdValue][]
   * total_volumes: [timestamp, usdValue][]
   */
  marketCaps: [number, number][];
  totalVolumes: [number, number][];
  /** Category slugs the coin belongs to (from CoinGecko categories) */
  categories?: string[];
}

// Map CoinGecko category strings → display label + compare coins
const CATEGORY_COMPARE: Record<string, { label: string; coins: { id: string; symbol: string }[] }> = {
  "decentralized-finance-defi": {
    label: "DeFi",
    coins: [
      { id: "uniswap", symbol: "UNI" },
      { id: "aave", symbol: "AAVE" },
      { id: "chainlink", symbol: "LINK" },
    ],
  },
  "layer-2": {
    label: "Layer 2",
    coins: [
      { id: "matic-network", symbol: "MATIC" },
      { id: "arbitrum", symbol: "ARB" },
      { id: "optimism", symbol: "OP" },
    ],
  },
  "meme-token": {
    label: "Meme",
    coins: [
      { id: "dogecoin", symbol: "DOGE" },
      { id: "shiba-inu", symbol: "SHIB" },
      { id: "pepe", symbol: "PEPE" },
    ],
  },
};

function fmt(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

function ratioLabel(ratio: number) {
  if (ratio > 0.5) return { text: "Extremely high", color: "text-red-400" };
  if (ratio > 0.2) return { text: "Very high", color: "text-orange-400" };
  if (ratio > 0.1) return { text: "Elevated", color: "text-yellow-400" };
  if (ratio > 0.05) return { text: "Moderate", color: "text-zinc-300" };
  return { text: "Low", color: "text-zinc-500" };
}

export default function InsightPanel({
  coinId,
  coinName,
  symbol,
  marketCap,
  volume24h,
  marketCaps,
  totalVolumes,
  categories = [],
}: InsightPanelProps) {
  // Compute daily Vol/MCap ratios from 30-day chart data
  // Chart returns one point per day for days=30
  const dailyRatios: number[] = [];

  // Align by index — CoinGecko returns parallel arrays with matching timestamps
  const len = Math.min(marketCaps.length, totalVolumes.length);
  for (let i = 0; i < len; i++) {
    const mc = marketCaps[i][1];
    const vol = totalVolumes[i][1];
    if (mc > 0) dailyRatios.push(vol / mc);
  }

  const currentRatio = marketCap > 0 ? volume24h / marketCap : 0;

  // Stats
  const min30 = dailyRatios.length ? Math.min(...dailyRatios) : 0;
  const max30 = dailyRatios.length ? Math.max(...dailyRatios) : 0;
  const avg30 = dailyRatios.length
    ? dailyRatios.reduce((a, b) => a + b, 0) / dailyRatios.length
    : 0;

  // Anomaly: top 10% = above 90th percentile of 30-day ratios
  const sorted = [...dailyRatios].sort((a, b) => a - b);
  const p90 = sorted.length
    ? sorted[Math.floor(sorted.length * 0.9)]
    : Infinity;
  const isAnomaly = dailyRatios.length >= 5 && currentRatio > p90;

  const { text: rLabel, color: rColor } = ratioLabel(currentRatio);

  // Compare quick-links: BTC + ETH always, plus up to 2 from matching category
  const defaultCoins = [
    { id: "bitcoin", symbol: "BTC" },
    { id: "ethereum", symbol: "ETH" },
  ];

  const categoryCoins: { id: string; symbol: string }[] = [];
  for (const cat of categories) {
    const slug = cat.toLowerCase().replace(/\s+/g, "-");
    if (CATEGORY_COMPARE[slug]) {
      for (const c of CATEGORY_COMPARE[slug].coins) {
        if (c.id !== coinId && categoryCoins.length < 3) {
          categoryCoins.push(c);
        }
      }
      break;
    }
  }

  const compareCoins = [
    ...defaultCoins.filter((c) => c.id !== coinId),
    ...categoryCoins.filter((c) => c.id !== coinId).slice(0, 2),
  ].slice(0, 4);

  // Bar chart: scale last 30 daily ratios to bar heights (max = 100%)
  const barData = dailyRatios.slice(-30);
  const barMax = barData.length ? Math.max(...barData, currentRatio) : 1;

  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
      <h2 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
        <span>📊</span> {coinName} Market Insight
      </h2>

      {/* Vol/MCap section */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-xs text-zinc-500">Vol/MCap Ratio (today)</span>
          <span className={`text-sm font-semibold ${rColor}`}>
            {(currentRatio * 100).toFixed(2)}% — {rLabel}
          </span>
        </div>

        {/* 30-day bar chart */}
        {barData.length > 0 && (
          <div className="flex items-end gap-px h-12 mb-2" title="30-day Vol/MCap history">
            {barData.map((r, i) => {
              const pct = barMax > 0 ? (r / barMax) * 100 : 0;
              const isLast = i === barData.length - 1;
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-t-sm transition-all ${
                    isLast
                      ? isAnomaly
                        ? "bg-red-500"
                        : "bg-violet-500"
                      : "bg-zinc-700 hover:bg-zinc-600"
                  }`}
                  style={{ height: `${Math.max(pct, 4)}%` }}
                />
              );
            })}
          </div>
        )}

        <div className="mb-2 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-lg bg-zinc-950 px-2 py-2">
            <p className="text-xs text-zinc-500">Market Cap</p>
            <p className="text-xs font-medium text-zinc-300">{fmt(marketCap)}</p>
          </div>
          <div className="rounded-lg bg-zinc-950 px-2 py-2">
            <p className="text-xs text-zinc-500">24h Volume</p>
            <p className="text-xs font-medium text-zinc-300">{fmt(volume24h)}</p>
          </div>
        </div>

        {/* 30-day stats row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-zinc-500">30d Low</p>
            <p className="text-xs font-medium text-zinc-300">{(min30 * 100).toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">30d Avg</p>
            <p className="text-xs font-medium text-zinc-300">{(avg30 * 100).toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">30d High</p>
            <p className="text-xs font-medium text-zinc-300">{(max30 * 100).toFixed(2)}%</p>
          </div>
        </div>

        {/* Anomaly flag */}
        {isAnomaly && (
          <div className="mt-2 flex items-start gap-2 rounded-lg bg-red-900/30 border border-red-700/40 px-3 py-2">
            <span className="text-red-400 text-sm shrink-0">⚠️</span>
            <p className="text-xs text-red-300">
              Today&apos;s Vol/MCap is in the{" "}
              <span className="font-semibold">top 10%</span> of the last 30
              days — unusually high trading activity relative to market cap.
              This can reflect news, large orders, exchange activity, or other market events.
            </p>
          </div>
        )}

        {/* Context blurb */}
        <p className="mt-2 text-xs text-zinc-600">
          Vol/MCap measures how much {symbol.toUpperCase()} is being traded
          relative to its size. A higher ratio often signals unusual market
          activity — a spike above the 30-day average may indicate news, a
          large order, or a liquidation cascade.
        </p>
      </div>

      {/* Compare quick-links */}
      {compareCoins.length > 0 && (
        <div className="border-t border-zinc-800 pt-3">
          <p className="text-xs text-zinc-500 mb-2">Compare with</p>
          <div className="flex flex-wrap gap-2">
            {compareCoins.map((c) => (
              <Link
                key={c.id}
                href={`/compare/${coinId}-vs-${c.id}`}
                className="px-3 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs text-zinc-300 hover:text-white transition-colors"
              >
                {symbol.toUpperCase()} vs {c.symbol}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}