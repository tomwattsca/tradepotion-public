import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const volSpikesSource = readFileSync('src/app/top/vol-spikes/page.tsx', 'utf8');
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
});
