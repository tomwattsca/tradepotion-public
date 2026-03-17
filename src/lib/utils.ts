export function formatPrice(price: number): string {
  if (price === null || price === undefined) return '$—';
  if (price === 0) return '$0.00';
  if (price < 0.000001) {
    // e.g. $0.000000106 — show 10 decimal places for very small prices
    return `$${price.toFixed(10).replace(/0+$/, '').replace(/\.$/, '')}`;
  }
  if (price < 0.0001) return `$${price.toFixed(8)}`;
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  if (price < 10000) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function formatMarketCap(value: number): string {
  if (!value) return '—';
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toLocaleString('en-US')}`;
}

export function formatPct(pct: number): string {
  if (pct === null || pct === undefined) return '—';
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

export function pctColor(pct: number): string {
  if (pct > 0) return 'text-emerald-400';
  if (pct < 0) return 'text-red-400';
  return 'text-zinc-400';
}

export function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}
