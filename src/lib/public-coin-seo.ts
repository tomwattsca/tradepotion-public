// Public SEO guardrails for evidence-backed coin pages that should remain crawlable.
// Keep this list small: only add public coin IDs that have appeared in GSC and render a
// useful Tradepotion coin page, but are not reliably present in the market-cap sitemap cache.
export const GSC_RETAINED_COIN_IDS = ['altlayer', 'aria-ai', 'stakestone'] as const;

export type GscRetainedCoinId = (typeof GSC_RETAINED_COIN_IDS)[number];

export function mergeCoinIdsForSitemap(cachedCoinIds: string[]): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const id of [...GSC_RETAINED_COIN_IDS, ...cachedCoinIds]) {
    if (!id || seen.has(id)) continue;
    seen.add(id);
    merged.push(id);
  }

  return merged;
}
