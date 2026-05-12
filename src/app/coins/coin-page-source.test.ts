import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const coinPageSource = readFileSync('src/app/coins/[slug]/page.tsx', 'utf8');
const alertFormSource = readFileSync('src/components/PriceAlertForm.tsx', 'utf8');

describe('coin page alert/tracking source guards', () => {
  it('keeps coin pages connected to the existing price-alert flow', () => {
    expect(coinPageSource).toContain('data-event="price_alert_click"');
    expect(coinPageSource).toContain('data-cta-location="coin_hero"');
    expect(coinPageSource).toContain('ctaLocation="coin_alert_form"');
    expect(coinPageSource).toContain('Set {coin.symbol.toUpperCase()} alert');
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
  });
});
