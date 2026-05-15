import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const homeSource = readFileSync('src/app/page.tsx', 'utf8');
const tableSource = readFileSync('src/components/SortableMarketTable.tsx', 'utf8');
const alertSource = readFileSync('src/components/HomePriceAlertBanner.tsx', 'utf8');
const coingeckoSource = readFileSync('src/lib/coingecko.ts', 'utf8');

describe('homepage market-data fallback posture', () => {
  it('uses cached public snapshots when CoinGecko homepage data is unavailable', () => {
    expect(homeSource).toContain('getCachedTopCoins');
    expect(homeSource).toContain('Showing cached market data');
    expect(homeSource).toContain('Market data temporarily unavailable');
    expect(coingeckoSource).toContain('price_snapshots');
    expect(coingeckoSource).toContain('getCachedTopCoins');
  });

  it('does not leave existing homepage market surfaces blank during data outages', () => {
    expect(homeSource).toContain('No 24h gainer data is available right now');
    expect(homeSource).toContain('No 24h loser data is available right now');
    expect(tableSource).toContain('Market table data is temporarily unavailable');
    expect(tableSource).toContain('CoinGecko data can be rate-limited or delayed');
  });

  it('keeps price-alert copy non-advisory and disables the form when market data is absent', () => {
    expect(alertSource).toContain('Alerts are informational market-data notifications only');
    expect(alertSource).toContain('no investment advice');
    expect(alertSource).toContain('disabled={topCoins.length === 0}');
    expect(alertSource).toContain('Market data unavailable');
  });

  it('adds privacy-safe internal-link hooks to existing homepage handoffs', () => {
    expect(homeSource).toContain('data-event="internal_link_click"');
    expect(homeSource).toContain('data-cta-location="home_hero_search"');
    expect(homeSource).toContain('data-cta-location="home_top_gainers"');
    expect(homeSource).toContain('data-cta-location="home_top_losers"');
    expect(homeSource).toContain('data-cta-location="home_gainer_coin"');
    expect(homeSource).toContain('data-cta-location="home_loser_coin"');
    expect(homeSource).toContain('data-coin-id={coin.id}');
    expect(homeSource).toContain('data-coin-symbol={coin.symbol}');
  });

});
