import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync('src/app/watchlist/page.tsx', 'utf8');
const clientSource = readFileSync('src/app/watchlist/WatchlistClient.tsx', 'utf8');
const sitemapSource = readFileSync('src/app/sitemap.ts', 'utf8');
const categoryFallbackSource = readFileSync('src/lib/category-sitemap-fallback.ts', 'utf8');

describe('watchlist utility SEO and tracking source guards', () => {
  it('keeps the nav-linked watchlist as a noindexed utility with self-canonical metadata', () => {
    expect(pageSource).toContain("canonical: 'https://tradepotion.com/watchlist'");
    expect(pageSource).toContain('index: false');
    expect(pageSource).toContain('follow: true');
    expect(pageSource).toContain("'@type': 'WebPage'");
  });

  it('connects the empty watchlist state to existing search and alert flows with non-PII hooks', () => {
    expect(clientSource).toContain('Crypto Watchlist');
    expect(clientSource).toContain('href="/search"');
    expect(clientSource).toContain('data-event="price_alert_click"');
    expect(clientSource).toContain('data-cta-location="watchlist_empty"');
    expect(clientSource).not.toContain('data-email');
  });

  it('does not add watchlist/search utility URLs to the XML sitemap or unsafe crypto schema/copy', () => {
    expect(sitemapSource).not.toContain('https://tradepotion.com/watchlist');
    expect(sitemapSource).not.toContain('https://tradepotion.com/search');
    expect(pageSource).not.toContain("'@type': 'Product'");
    expect(pageSource).not.toContain('InStock');
    expect(clientSource).not.toContain('>Buy ');
  });

  it('keeps existing category sitemap coverage stable when CoinGecko categories are unavailable', () => {
    expect(sitemapSource).toContain('FALLBACK_CATEGORY_IDS');
    expect(sitemapSource).toContain('keep fallback IDs');
    expect(categoryFallbackSource).toContain("'decentralized-finance-defi'");
    expect(categoryFallbackSource).toContain("'layer-2'");
    expect(categoryFallbackSource).toContain("'artificial-intelligence'");
  });
});
