import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync('src/app/category/[slug]/page.tsx', 'utf8');
const nextConfigSource = readFileSync('next.config.mjs', 'utf8');

describe('category page SEO/CRO source guards', () => {

  it('consolidates the legacy DeFi category alias into the canonical category URL', () => {
    expect(nextConfigSource).toContain("source: '/category/defi'");
    expect(nextConfigSource).toContain("destination: '/category/decentralized-finance-defi'");
  });

  it('keeps category pages connected to alert/search actions and compliance context', () => {
    expect(source).toContain('data-event="price_alert_click"');
    expect(source).toContain('data-cta-location="category_hero"');
    expect(source).toContain('Data provided by CoinGecko');
    expect(source).toContain('not financial advice');
  });

  it('keeps the empty category state useful instead of a dead end', () => {
    expect(source).toContain('Live category prices are temporarily unavailable.');
    expect(source).toContain('You can still research popular tokens');
    expect(source).toContain('fallbackCoins.map');
    expect(source).toContain('relatedCategories.map');
  });

  it('uses informational WebPage schema for category pages', () => {
    expect(source).toContain("'@type': 'WebPage'");
    expect(source).toContain('cryptocurrency market data');
    expect(source).not.toContain("'@type': 'Product'");
    expect(source).not.toContain('InStock');
  });
});
