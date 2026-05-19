import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const homeSource = readFileSync('src/app/page.tsx', 'utf8');
const tableSource = readFileSync('src/components/SortableMarketTable.tsx', 'utf8');
const alertSource = readFileSync('src/components/HomePriceAlertBanner.tsx', 'utf8');
const coingeckoSource = readFileSync('src/lib/coingecko.ts', 'utf8');

describe('homepage market-data fallback posture', () => {
  it('uses cached public snapshots when CoinGecko homepage data is unavailable', () => {
    expect(homeSource).toContain('getCachedTopCoins');
    expect(homeSource).toContain('Data status: cached CoinGecko snapshot');
    expect(homeSource).toContain('Live CoinGecko market rows are temporarily unavailable');
    expect(homeSource).toContain('Crypto market snapshot');
    expect(homeSource).toContain('Crypto Market Prices, Market Cap Rankings & Price Alerts');
    expect(homeSource).toContain('some 1h, 7d, and chart fields may be unavailable');
    expect(homeSource).toContain('data-market-data-status={marketDataStatus}');
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

  it('keeps homepage metadata and table labels honest during cached-data states', () => {
    expect(homeSource).toContain("title: 'Crypto Market Price Tracker | Rankings & Price Alerts'");
    expect(homeSource).toContain('clearly labels cached public snapshots');
    expect(homeSource).toContain('Crypto market snapshot');
    expect(homeSource).toContain('Market data source: CoinGecko snapshot');
    expect(homeSource).toContain('Top 250 Cryptocurrencies by Market Snapshot');
    expect(homeSource).toContain('Top Cryptocurrencies by Market Snapshot');
    expect(homeSource).toContain('dashes mean a metric is unavailable from the current source');
    expect(homeSource).not.toContain('Top 100 Cryptocurrencies');
    expect(homeSource).not.toContain('Live Crypto Prices, Market Cap Rankings & Price Alerts');
    expect(homeSource).toContain('Prices can differ from exchange quotes');
    expect(homeSource).not.toContain('Live CoinGecko market rows available');
    expect(homeSource).not.toContain('Latest Cached Crypto Prices');
    expect(homeSource).not.toContain('Currently showing cached public snapshots');
    expect(homeSource).not.toContain('Data status: CoinGecko snapshot loaded');
    expect(homeSource).not.toContain('Showing cached market data');
  });

  it('adds privacy-safe internal-link hooks to existing homepage handoffs', () => {
    expect(homeSource).toContain('data-event="internal_link_click"');
    expect(homeSource).toContain('data-cta-location="home_hero_search"');
    expect(homeSource).toContain('data-cta-location="home_top_gainers"');
    expect(homeSource).toContain('data-cta-location="home_top_losers"');
    expect(homeSource).toContain('data-cta-location="home_gainer_coin"');
    expect(homeSource).toContain('data-cta-location="home_loser_coin"');
    expect(tableSource).toContain('data-cta-location="home_market_coin"');
    expect(homeSource).toContain('data-coin-id={coin.id}');
    expect(tableSource).toContain('data-coin-id={coin.id}');
    expect(homeSource).toContain('data-coin-symbol={coin.symbol}');
    expect(tableSource).toContain('data-coin-symbol={coin.symbol}');
  });

});
