import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const coinPageSource = readFileSync('src/app/coins/[slug]/page.tsx', 'utf8');
const alertFormSource = readFileSync('src/components/PriceAlertForm.tsx', 'utf8');
const insightPanelSource = readFileSync('src/components/InsightPanel.tsx', 'utf8');

describe('coin page alert/tracking source guards', () => {
  it('keeps coin pages connected to the existing price-alert flow', () => {
    expect(coinPageSource).toContain('data-event="price_alert_click"');
    expect(coinPageSource).toContain('data-cta-location="coin_hero"');
    expect(coinPageSource).toContain('ctaLocation="coin_alert_form"');
    expect(coinPageSource).toContain('Set {coin.symbol.toUpperCase()} alert');
  });

  it('aligns GSC-visible coin pages with price and market-cap search intent', () => {
    expect(coinPageSource).toContain('`${name} (${symbol}) Coin Price, Market Cap & Alerts`');
    expect(coinPageSource).toContain('{coin.name} coin price');
    expect(coinPageSource).toContain('Live USD coin/token price, market cap, 24h volume, chart history');
    expect(coinPageSource).toContain('{coinName} coin, token, and crypto price context');
    expect(coinPageSource).toContain('Coin research guide');
    expect(coinPageSource).toContain('non-advisory price alerts for {coin.name}');
  });

  it('keeps the reusable price alert form measurable without collecting PII in attributes', () => {
    expect(alertFormSource).toContain('ctaLocation?: string');
    expect(alertFormSource).toContain("data-event={ctaLocation ? 'price_alert_click' : undefined}");
    expect(alertFormSource).toContain('data-cta-location={ctaLocation}');
    expect(alertFormSource).toContain('data-coin-id={coinId}');
    expect(alertFormSource).not.toContain('data-email');
  });

  it('preserves informational coin-page schema posture', () => {
    expect(coinPageSource).toContain("'@type': 'WebPage'");
    expect(coinPageSource).not.toContain("'@type': 'Product'");
    expect(coinPageSource).not.toContain('InStock');
    expect(coinPageSource).not.toContain('>Buy ');
    expect(coinPageSource).not.toContain('Trade now');
    expect(coinPageSource).toContain('informational market data and research links only');
  });

  it('keeps GSC-visible coin URLs renderable during CoinGecko rate limits', () => {
    expect(coinPageSource).toContain('getCoinDetailWithCacheFallback');
    expect(coinPageSource).toContain('getCachedCoinDetail');
    expect(coinPageSource).toContain('CoinGecko detail unavailable');
    expect(coinPageSource).toContain('priceSnapshots');
    expect(coinPageSource).toContain('if (!coin) {\n      notFound();\n    }');
  });

  it('labels unavailable 30-day Vol/MCap baselines instead of showing false zero history', () => {
    expect(insightPanelSource).toContain('hasHistoryBaseline');
    expect(insightPanelSource).toContain('30d baseline unavailable');
    expect(insightPanelSource).toContain('instead of manufacturing a 0.00% average');
    expect(insightPanelSource).toContain('should not be treated as an unusual-activity signal');
    expect(insightPanelSource).toContain('hasHistoryBaseline && currentRatio > p90');
  });

});
