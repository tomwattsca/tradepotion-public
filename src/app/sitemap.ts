import { MetadataRoute } from 'next';
import { getTrendingCoins, getCategories } from '@/lib/coingecko';

export const revalidate = 3600; // regenerate every hour

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
    ...categoryEntries,
    ...coinEntries,
  ];
}
