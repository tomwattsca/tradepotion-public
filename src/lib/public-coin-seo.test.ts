import { describe, expect, it } from 'vitest';
import { GSC_RETAINED_COIN_IDS, mergeCoinIdsForSitemap } from './public-coin-seo';

describe('public coin SEO retention list', () => {
  it('keeps GSC-visible coin URLs in the sitemap ahead of cached market-cap rows', () => {
    const merged = mergeCoinIdsForSitemap(['bitcoin', 'ethereum']);

    for (const id of GSC_RETAINED_COIN_IDS) {
      expect(merged).toContain(id);
    }
    expect(merged.slice(0, GSC_RETAINED_COIN_IDS.length)).toEqual([...GSC_RETAINED_COIN_IDS]);
    expect(merged).toContain('bitcoin');
  });

  it('deduplicates retained IDs that already exist in the cached sitemap rows', () => {
    const merged = mergeCoinIdsForSitemap(['bitcoin', 'altlayer', 'aria-ai', 'ethereum', 'zero-gravity']);

    expect(merged.filter((id) => id === 'altlayer')).toHaveLength(1);
    expect(merged.filter((id) => id === 'aria-ai')).toHaveLength(1);
    expect(merged.filter((id) => id === 'zero-gravity')).toHaveLength(1);
    expect(merged).toEqual(['altlayer', 'aria-ai', 'stakestone', 'zero-gravity', 'bitcoin', 'ethereum']);
  });
});
