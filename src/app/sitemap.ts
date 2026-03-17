import { MetadataRoute } from 'next';
import { query } from '@/lib/db';
import { getCategories } from '@/lib/coingecko';

export const dynamic = 'force-dynamic';

const TOP_COMPARE_PAIRS = [
  'bitcoin-vs-ethereum', 'bitcoin-vs-solana', 'bitcoin-vs-dogecoin', 'bitcoin-vs-ripple',
  'bitcoin-vs-litecoin', 'ethereum-vs-solana', 'ethereum-vs-bnb', 'ethereum-vs-cardano',
  'ethereum-vs-avalanche', 'ethereum-vs-polygon', 'ethereum-vs-dogecoin', 'ethereum-vs-ripple',
  'ethereum-vs-arbitrum', 'ethereum-vs-shiba-inu', 'solana-vs-avalanche', 'solana-vs-cardano',
  'solana-vs-polygon', 'solana-vs-bnb', 'solana-vs-ripple', 'solana-vs-dogecoin',
  'bnb-vs-cardano', 'bnb-vs-avalanche', 'bnb-vs-ripple', 'ripple-vs-cardano',
  'ripple-vs-dogecoin', 'ripple-vs-litecoin', 'cardano-vs-avalanche', 'cardano-vs-polygon',
  'dogecoin-vs-shiba-inu', 'dogecoin-vs-pepe', 'bitcoin-vs-cardano', 'bitcoin-vs-avalanche',
  'bitcoin-vs-polygon', 'bitcoin-vs-chainlink', 'bitcoin-vs-polkadot', 'ethereum-vs-polkadot',
  'ethereum-vs-chainlink', 'ethereum-vs-uniswap', 'solana-vs-polkadot', 'solana-vs-chainlink',
  'avalanche-vs-polygon', 'avalanche-vs-chainlink', 'polygon-vs-arbitrum', 'polygon-vs-chainlink',
  'shiba-inu-vs-pepe', 'bitcoin-vs-near', 'ethereum-vs-near', 'bitcoin-vs-sui',
  'ethereum-vs-sui', 'solana-vs-sui',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Read cached coin IDs from DB (populated by cron every 10min) — fast, no CoinGecko calls
  let coinIds: string[] = [];
  try {
    const cached = await query<{ coin_ids: string[] }>(
      'SELECT coin_ids FROM sitemap_cache WHERE key = $1',
      ['top_coins']
    );
    if (cached.length > 0) {
      coinIds = cached[0].coin_ids;
    }
  } catch {
    // DB unavailable or cache empty — return minimal sitemap
  }

  // Coin pages (up to 1000) — ranked by market cap via cron cache
  const coinEntries: MetadataRoute.Sitemap = coinIds.slice(0, 1000).map((id, rank) => ({
    url: `https://tradepotion.com/coins/${id}`,
    lastModified: now,
    changeFrequency: 'hourly',
    priority: rank < 10 ? 0.95 : rank < 100 ? 0.9 : rank < 500 ? 0.8 : 0.7,
  }));

  // Categories — quick single call, has its own ISR cache
  let categoryEntries: MetadataRoute.Sitemap = [];
  try {
    const categories = await getCategories();
    categoryEntries = categories.slice(0, 100).map((cat) => ({
      url: `https://tradepotion.com/category/${cat.id}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    }));
  } catch {
    // skip
  }

  // Top 50 curated compare pairs
  const compareEntries: MetadataRoute.Sitemap = TOP_COMPARE_PAIRS.map((pair) => ({
    url: `https://tradepotion.com/compare/${pair}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: pair.startsWith('bitcoin') || pair.includes('-vs-ethereum') ? 0.85 : 0.75,
  }));

  // Auto-generate additional pairs from top 20 cached coins
  const top20 = coinIds.slice(0, 20);
  const curatedSet = new Set(TOP_COMPARE_PAIRS);
  const autoCompareEntries: MetadataRoute.Sitemap = [];
  for (let i = 0; i < top20.length; i++) {
    for (let j = i + 1; j < top20.length; j++) {
      const pair = `${top20[i]}-vs-${top20[j]}`;
      if (!curatedSet.has(pair)) {
        autoCompareEntries.push({
          url: `https://tradepotion.com/compare/${pair}`,
          lastModified: now,
          changeFrequency: 'daily',
          priority: 0.65,
        });
      }
    }
  }

  return [
    { url: 'https://tradepotion.com', lastModified: now, changeFrequency: 'hourly', priority: 1.0 },
    { url: 'https://tradepotion.com/top/gainers', lastModified: now, changeFrequency: 'hourly', priority: 0.8 },
    { url: 'https://tradepotion.com/top/losers', lastModified: now, changeFrequency: 'hourly', priority: 0.8 },
    { url: 'https://tradepotion.com/movers/volume-spikes', lastModified: now, changeFrequency: 'hourly', priority: 0.8 },
    { url: 'https://tradepotion.com/top/trending', lastModified: now, changeFrequency: 'hourly', priority: 0.8 },
    { url: 'https://tradepotion.com/top/new-listings', lastModified: now, changeFrequency: 'daily', priority: 0.75 },
    { url: 'https://tradepotion.com/search', lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    ...categoryEntries,
    ...coinEntries,
    ...compareEntries,
    ...autoCompareEntries,
  ];
}
