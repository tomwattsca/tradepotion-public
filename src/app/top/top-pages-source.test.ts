import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const volSpikesSource = readFileSync('src/app/top/vol-spikes/page.tsx', 'utf8');
const gainersSource = readFileSync('src/app/top/gainers/page.tsx', 'utf8');
const losersSource = readFileSync('src/app/top/losers/page.tsx', 'utf8');
const trendingSource = readFileSync('src/app/top/trending/page.tsx', 'utf8');
const newListingsSource = readFileSync('src/app/top/new-listings/page.tsx', 'utf8');
const topListPanelSource = readFileSync('src/components/TopListContextPanel.tsx', 'utf8');
const gainersClientSource = readFileSync('src/components/GainersClient.tsx', 'utf8');
const trendingClientSource = readFileSync('src/components/TrendingClient.tsx', 'utf8');
const newListingsClientSource = readFileSync('src/components/NewListingsClient.tsx', 'utf8');
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

  it('adds privacy-safe measurement hooks to the existing volume-spikes research flow', () => {
    const volSpikesClientSource = readFileSync('src/components/VolSpikesClient.tsx', 'utf8');
    expect(volSpikesSource).toContain('top_vol_spikes_context');
    expect(volSpikesSource).toContain('data-event="price_alert_click"');
    expect(volSpikesSource).toContain('top_vol_spikes_context_watchlist');
    expect(volSpikesSource).toContain('top_vol_spikes_context_search');
    expect(volSpikesClientSource).toContain('data-event="filter_change"');
    expect(volSpikesClientSource).toContain('data-filter-name="min_volume"');
    expect(volSpikesClientSource).toContain('data-filter-name="market_cap_tier"');
    expect(volSpikesClientSource).toContain('data-cta-location="top_vol_spikes_coin"');
    expect(volSpikesClientSource).not.toContain("searchParams.get('q')");
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
    expect(topListPanelSource).toContain('data-event="internal_link_click"');
    expect(topListPanelSource).toContain('`${copy.ctaLocation}_watchlist`');
    expect(topListPanelSource).toContain('`${copy.ctaLocation}_search`');
    expect(topListPanelSource).toContain('not financial advice');
    expect(topListPanelSource).toContain('CoinGecko');
    expect(topListPanelSource).toContain('top_gainers_context');
    expect(topListPanelSource).toContain('top_losers_context');
    expect(topListPanelSource).toContain('top_trending_context');
    expect(topListPanelSource).toContain('top_new_listings_context');
  });

  it('adds privacy-safe measurement to top-list filters and coin-row handoffs', () => {
    expect(gainersClientSource).toContain('data-event="filter_change"');
    expect(gainersClientSource).toContain('data-filter-name="range"');
    expect(gainersClientSource).toContain('data-filter-name="min_volume"');
    expect(gainersClientSource).toContain('data-filter-name="market_cap_tier"');
    expect(gainersClientSource).toContain('data-cta-location={`top_${mode}_coin`}');
    expect(gainersClientSource).toContain('data-coin-id={coin.id}');
    expect(trendingClientSource).toContain('data-cta-location="top_trending_coin"');
    expect(newListingsClientSource).toContain('data-cta-location="top_new_listings_coin"');
    for (const source of [gainersClientSource, trendingClientSource, newListingsClientSource]) {
      expect(source).toContain('data-event="internal_link_click"');
      expect(source).toContain('data-coin-id={coin.id}');
      expect(source).toContain('data-coin-symbol={coin.symbol}');
      expect(source).not.toContain("searchParams.get('q')");
    }
  });

  it('keeps top-list copy away from buy-action and unsupported superlative framing', () => {
    const combined = [gainersSource, losersSource, trendingSource, newListingsSource, topListPanelSource].join('\n');
    expect(combined).not.toContain('pumping');
    expect(combined).not.toContain('More actionable than CoinGecko');
    expect(combined).not.toContain('Trade now');
    expect(combined).not.toContain('Buy ');
  });
});
