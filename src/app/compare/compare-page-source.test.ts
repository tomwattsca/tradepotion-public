import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const source = readFileSync('src/app/compare/[pair]/page.tsx', 'utf8');

describe('compare page research and tracking posture', () => {
  it('routes comparison users into existing coin alert flows with stable non-PII hooks', () => {
    expect(source).toContain('Comparison research workflow');
    expect(source).toContain('data-event="price_alert_click"');
    expect(source).toContain('data-cta-location="compare_coin_a"');
    expect(source).toContain('data-cta-location="compare_coin_b"');
    expect(source).toContain('data-coin-id={coinAId}');
    expect(source).toContain('data-coin-id={coinBId}');
    expect(source).toContain('aria-label={`Set a price alert for ${coinAName}`}');
    expect(source).toContain('aria-label={`Set a price alert for ${coinBName}`}');
  });

  it('keeps comparison copy informational and away from buy/referral/product claims', () => {
    expect(source).toContain('not recommendations to buy, sell, or trade crypto assets');
    expect(source).toContain("'@type': 'Dataset'");
    expect(source).toContain("'@type': 'WebPage'");
    expect(source).not.toContain("'@type': 'Product'");
    expect(source).not.toContain('InStock');
    expect(source).not.toContain('TRADEPOTION');
    expect(source).not.toContain('affiliate');
  });
});
