import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const configSource = fs.readFileSync(path.join(root, 'next.config.mjs'), 'utf8');

describe('legacy public route redirects', () => {
  it('uses permanent server-side redirects for existing thin legacy route shells', () => {
    expect(configSource).toContain("source: '/category/defi', destination: '/category/decentralized-finance-defi'");
    expect(configSource).toContain("source: '/coin/:slug', destination: '/coins/:slug'");
    expect(configSource).toContain("source: '/compare', destination: '/compare/bitcoin-vs-ethereum'");
    expect(configSource).toContain("source: '/movers/volume-spikes', destination: '/top/vol-spikes'");
    expect(configSource).toContain("source: '/defi', destination: '/category/decentralized-finance-defi'");
    expect(configSource).toContain("source: '/layer2', destination: '/category/layer-2'");
    expect(configSource).toContain("source: '/meme', destination: '/category/meme-token'");
    expect(configSource).toContain("source: '/markets', destination: '/'");
    expect(configSource).toContain('permanent: true');
  });


  it('keeps the homepage self-canonical for redirected legacy market paths', () => {
    const homeSource = fs.readFileSync(path.join(root, 'src/app/page.tsx'), 'utf8');
    expect(homeSource).toContain("canonical: '/'");
  });

  it('keeps legacy sources out of the XML sitemap instead of indexing redirect shells', () => {
    const sitemapSource = fs.readFileSync(path.join(root, 'src/app/sitemap.ts'), 'utf8');
    expect(sitemapSource).not.toContain('tradepotion.com/category/defi');
    expect(sitemapSource).not.toContain('tradepotion.com/coin/');
    expect(sitemapSource).not.toContain('tradepotion.com/compare,');
    expect(sitemapSource).not.toContain('tradepotion.com/movers/volume-spikes');
    expect(sitemapSource).not.toContain('tradepotion.com/defi');
    expect(sitemapSource).not.toContain('tradepotion.com/layer2');
    expect(sitemapSource).not.toContain('tradepotion.com/meme');
    expect(sitemapSource).not.toContain('tradepotion.com/markets');
  });
});
