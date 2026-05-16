import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const layoutSource = readFileSync('src/app/layout.tsx', 'utf8');
const navSource = readFileSync('src/components/Navbar.tsx', 'utf8');

describe('sitewide schema and navigation measurement posture', () => {
  it('uses informational Organization/WebSite schema without app Offer markup', () => {
    expect(layoutSource).toContain("'@graph'");
    expect(layoutSource).toContain("'@type': 'Organization'");
    expect(layoutSource).toContain("'@type': 'WebSite'");
    expect(layoutSource).toContain("'@type': 'SearchAction'");
    expect(layoutSource).toContain('https://tradepotion.com/search?q={search_term_string}');
    expect(layoutSource).not.toContain("'@type': 'WebApplication'");
    expect(layoutSource).not.toContain("'@type': 'Offer'");
    expect(layoutSource).not.toContain('priceCurrency');
  });

  it('makes existing global navigation links measurable without PII or query text', () => {
    expect(navSource).toContain('data-event="internal_link_click"');
    expect(navSource).toContain('data-cta-location="global_nav_markets"');
    expect(navSource).toContain('data-cta-location="global_nav_defi"');
    expect(navSource).toContain('data-cta-location="global_nav_vol_spikes"');
    expect(navSource).toContain('data-cta-location="global_nav_watchlist"');
    expect(navSource).toContain('data-cta-location="global_search_submit"');
    expect(navSource).toContain('aria-label="Search coins"');
    expect(navSource).toContain('data-cta-location="mobile_nav_markets"');
    expect(navSource).toContain('data-cta-location="mobile_nav_watchlist"');
    expect(navSource).not.toContain('data-search-query');
    expect(navSource).not.toContain('data-email');
  });
});
