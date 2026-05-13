import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const volSpikesSource = readFileSync('src/app/top/vol-spikes/page.tsx', 'utf8');
const gainersSource = readFileSync('src/app/top/gainers/page.tsx', 'utf8');
const losersSource = readFileSync('src/app/top/losers/page.tsx', 'utf8');
const trendingSource = readFileSync('src/app/top/trending/page.tsx', 'utf8');
const newListingsSource = readFileSync('src/app/top/new-listings/page.tsx', 'utf8');
const topListPanelSource = readFileSync('src/components/TopListContextPanel.tsx', 'utf8');
const sitemapSource = readFileSync('src/app/sitemap.ts', 'utf8');

describe('top pages SEO/source guards', () => {
  it('keeps the existing volume-spikes page indexable and internally supported', () => {
    expect(volSpikesSource).toContain("alternates: { canonical: 'https://tradepotion.com/top/vol-spikes' }");
    expect(sitemapSource).toContain("https://tradepotion.com/top/vol-spikes");
    expect(sitemapSource).not.toContain("https://tradepotion.com/search");
  });

  it('uses informational volume-spikes copy and schema without recommendation framing', () => {
    expect(volSpikesSource).toContain("'@type': 'WebPage'");
    expect(volSpikesSource).toContain('Neutral cryptocurrency market data');
    expect(volSpikesSource).toContain('not financial advice');
    expect(volSpikesSource).not.toContain('potential breakouts');
    expect(volSpikesSource).not.toContain('leading signal for breakouts');
    expect(volSpikesSource).not.toContain("'@type': 'Product'");
    expect(volSpikesSource).not.toContain('InStock');
  });

  it('adds informational schema and alert handoff context to existing top-list pages', () => {
    for (const source of [gainersSource, losersSource, trendingSource, newListingsSource]) {
      expect(source).toContain("'@type': 'WebPage'");
      expect(source).toContain('TopListContextPanel');
      expect(source).not.toContain("'@type': 'Product'");
      expect(source).not.toContain('InStock');
      expect(source).not.toContain('>Buy ');
    }
    expect(topListPanelSource).toContain('data-event="price_alert_click"');
    expect(topListPanelSource).toContain('not financial advice');
    expect(topListPanelSource).toContain('CoinGecko');
    expect(topListPanelSource).toContain('top_gainers_context');
    expect(topListPanelSource).toContain('top_losers_context');
    expect(topListPanelSource).toContain('top_trending_context');
    expect(topListPanelSource).toContain('top_new_listings_context');
  });

  it('keeps top-list copy away from buy-action and unsupported superlative framing', () => {
    const combined = [gainersSource, losersSource, trendingSource, newListingsSource, topListPanelSource].join('\n');
    expect(combined).not.toContain('pumping');
    expect(combined).not.toContain('More actionable than CoinGecko');
    expect(combined).not.toContain('Trade now');
    expect(combined).not.toContain('Buy ');
  });
});
