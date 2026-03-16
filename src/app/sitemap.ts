import { MetadataRoute } from 'next';
import { getTrendingCoins, getCategories } from '@/lib/coingecko';

export const revalidate = 3600; // regenerate every hour

// Popular "X vs Y" pairs for SEO keyword coverage
const COMPARE_PAIRS = [
  'bitcoin-vs-ethereum',
  'bitcoin-vs-solana',
  'bitcoin-vs-dogecoin',
  'bitcoin-vs-xrp',
  'ethereum-vs-solana',
  'ethereum-vs-bnb',
  'ethereum-vs-avalanche-2',
  'solana-vs-avalanche-2',
  'dogecoin-vs-shiba-inu',
  'bitcoin-vs-litecoin',
  'ethereum-vs-cardano',
  'bnb-vs-solana',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  let coinEntries: MetadataRoute.Sitemap = [];
  let categoryEntries: MetadataRoute.Sitemap = [];

  try {
    const coins = await getTrendingCoins(250);
    coinEntries = coins.map((coin) => ({
      url: `https://tradepotion.com/coins/${coin.id}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: coin.market_cap_rank <= 50 ? 0.9 : 0.8,
    }));
  } catch {
    // silently skip if CoinGecko unavailable during build
  }

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

  const compareEntries: MetadataRoute.Sitemap = COMPARE_PAIRS.map((pair) => ({
    url: `https://tradepotion.com/compare/${pair}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [
    {
      url: 'https://tradepotion.com',
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: 'https://tradepotion.com/search',
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    // Top movers pages
    {
      url: 'https://tradepotion.com/top/gainers',
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: 'https://tradepotion.com/top/losers',
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: 'https://tradepotion.com/top/vol-spikes',
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    // Markets
    {
      url: 'https://tradepotion.com/markets',
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    // Compare pairs
    ...compareEntries,
    // Categories and coins
    ...categoryEntries,
    ...coinEntries,
  ];
}
