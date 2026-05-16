import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

const pageSource = fs.readFileSync(path.join(process.cwd(), 'src/app/search/page.tsx'), 'utf8');
const clientSource = fs.readFileSync(path.join(process.cwd(), 'src/app/search/SearchClient.tsx'), 'utf8');
const sitemapSource = fs.readFileSync(path.join(process.cwd(), 'src/app/sitemap.ts'), 'utf8');

describe('Search utility SEO and measurement posture', () => {
  it('keeps the utility noindexed while server-rendering explanatory H1 copy', () => {
    expect(pageSource).toContain('index: false');
    expect(pageSource).toContain('<h1');
    expect(pageSource).toContain('Search Crypto Prices');
    expect(pageSource).toContain('intentionally kept out of Google&apos;s index');
    expect(pageSource).toContain('https://tradepotion.com/search');
  });

  it('adds privacy-safe internal-link hooks without forwarding query text', () => {
    expect(pageSource).toContain('data-cta-location="search_back_markets"');
    expect(clientSource).toContain("location: 'search_popular_bitcoin'");
    expect(clientSource).toContain('data-cta-location="search_result_coin"');
    expect(clientSource).toContain('data-coin-id={coin.id}');
    expect(clientSource).toContain('data-coin-symbol={coin.symbol.toUpperCase()}');
    expect(clientSource).not.toContain('data-query');
    expect(clientSource).not.toContain('data-search');
  });

  it('keeps search out of the XML sitemap', () => {
    expect(sitemapSource).not.toContain('https://tradepotion.com/search');
  });

  it('keeps the search API resilient with a cached DB fallback when CoinGecko search is unavailable', () => {
    const routeSource = fs.readFileSync(path.join(process.cwd(), 'src/app/api/search/route.ts'), 'utf8');

    expect(routeSource).toContain('searchCachedCoins');
    expect(routeSource).toContain("'x-tradepotion-search-source': 'cached-db'");
    expect(routeSource).toContain('LOWER(c.name) LIKE $1');
    expect(routeSource).toContain('LOWER(c.symbol) LIKE $1');
  });

});
