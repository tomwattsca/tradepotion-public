import { MetadataRoute } from 'next';
import { query } from '@/lib/db';
import { getCategories } from '@/lib/coingecko';

// force-dynamic: sitemap reads from DB cache, fast + no CoinGecko rate limits
export const dynamic = 'force-dynamic';

// Top 50 curated compare pairs (high search volume)
const TOP_COMPARE_PAIRS = [
  'bitcoin-vs-ethereum',
  'bitcoin-vs-solana',
  'bitcoin-vs-dogecoin',
  'bitcoin-vs-ripple',
  'bitcoin-vs-litecoin',
  'ethereum-vs-solana',
  'ethereum-vs-bnb',
  'ethereum-vs-cardano',
  'ethereum-vs-avalanche',
  'ethereum-vs-polygon',
  'ethereum-vs-dogecoin',
  'ethereum-vs-ripple',
  'ethereum-vs-arbitrum',
  'ethereum-vs-shiba-inu',
  'solana-vs-avalanche',
  'solana-vs-cardano',
  'solana-vs-polygon',
  'solana-vs-bnb',
  'solana-vs-ripple',
  'solana-vs-dogecoin',
  'bnb-vs-cardano',
  'bnb-vs-avalanche',
  'bnb-vs-ripple',
  'ripple-vs-cardano',
  'ripple-vs-dogecoin',
  'ripple-vs-litecoin',
  'cardano-vs-avalanche',
  'cardano-vs-polygon',
  'dogecoin-vs-shiba-inu',
  'dogecoin-vs-pepe',
  'bitcoin-vs-cardano',
  'bitcoin-vs-avalanche',
  'bitcoin-vs-polygon',
  'bitcoin-vs-chainlink',
  'bitcoin-vs-polkadot',
  'ethereum-vs-polkadot',
  'ethereum-vs-chainlink',
  'ethereum-vs-uniswap',
  'solana-vs-polkadot',
  'solana-vs-chainlink',
  'avalanche-vs-polygon',
  'avalanche-vs-chainlink',
  'polygon-vs-arbitrum',
  'polygon-vs-chainlink',
  'shiba-inu-vs-pepe',
  'bitcoin-vs-near',
  'ethereum-vs-near',
  'bitcoin-vs-sui',
  'ethereum-vs-sui',
  'solana-vs-sui',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Read coin IDs from DB cache (populated by cron every 10 min, ~250 coins)
  // Falls back to empty array if cache not yet populated
  let coinIds: string[] = [];
  try {
    const rows = await query<{ coin_ids: string[] }>(
      `SELECT coin_ids FROM sitemap_cache WHERE key = 'top_coins' LIMIT 1`
    );
    if (rows.length > 0) {
      coinIds = rows[0].coin_ids;
    }
  } catch {
    // DB unavailable — sitemap still serves static pages
  }

  const coinEntries: MetadataRoute.Sitemap = coinIds.map((id, idx) => ({
    url: `https://tradepotion.com/coins/${id}`,
    lastModified: now,
    changeFrequency: 'hourly',
    priority: idx < 10 ? 0.95 : idx < 100 ? 0.9 : idx < 250 ? 0.8 : 0.7,
  }));

  // Category pages (cached via Next.js fetch, ~100 categories)
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
    // silently skip
  }

  // Top 50 curated compare pairs
  const compareEntries: MetadataRoute.Sitemap = TOP_COMPARE_PAIRS.map((pair) => ({
    url: `https://tradepotion.com/compare/${pair}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: pair.startsWith('bitcoin') || pair.includes('-vs-ethereum') ? 0.85 : 0.75,
  }));

  return [
    {
      url: 'https://tradepotion.com',
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: 'https://tradepotion.com/top/gainers',
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: 'https://tradepotion.com/top/losers',
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: 'https://tradepotion.com/top/vol-spikes',
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: 'https://tradepotion.com/search',
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...categoryEntries,
    ...coinEntries,
    ...compareEntries,
  ];
}
