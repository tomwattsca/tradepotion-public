import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

const routeSource = fs.readFileSync(path.join(process.cwd(), 'src/app/api/coins/batch/route.ts'), 'utf8');

describe('Watchlist batch coin API resilience', () => {
  it('uses the configured CoinGecko API key and timeout for live batch requests', () => {
    expect(routeSource).toContain('COINGECKO_API_KEY');
    expect(routeSource).toContain("'x-cg-demo-api-key'");
    expect(routeSource).toContain('AbortSignal.timeout(10_000)');
  });

  it('falls back to cached public DB rows when CoinGecko is unavailable', () => {
    expect(routeSource).toContain('getCachedWatchlistCoins');
    expect(routeSource).toContain('SELECT DISTINCT ON (c.slug)');
    expect(routeSource).toContain('WHERE c.slug = ANY($1::text[])');
    expect(routeSource).toContain("'x-tradepotion-coins-source': 'cached-db'");
  });

  it('maps cached rows to the watchlist coin shape without unsafe commerce fields', () => {
    expect(routeSource).toContain('calculatePctChangeFromAbsolute(currentPrice, absoluteChange)');
    expect(routeSource).toContain("sparkline_in_7d: { price: [] }");
    expect(routeSource).not.toContain('InStock');
    expect(routeSource).not.toContain('Product');
    expect(routeSource).not.toContain('Offer');
  });
});
