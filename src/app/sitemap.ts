import { MetadataRoute } from 'next';
import { getTrendingCoins, getCategories } from '@/lib/coingecko';

export const revalidate = 3600; // regenerate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  let coins: { id: string; market_cap_rank: number }[] = [];
  let coinEntries: MetadataRoute.Sitemap = [];
  let categoryEntries: MetadataRoute.Sitemap = [];
  const compareEntries: MetadataRoute.Sitemap = [];

  try {
    coins = await getTrendingCoins(500);

    // Individual coin pages — highest SEO value
    coinEntries = coins.map((coin) => ({
      url: `https://tradepotion.com/coins/${coin.id}`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: coin.market_cap_rank <= 10 ? 0.9 : coin.market_cap_rank <= 100 ? 0.8 : 0.7,
    }));

    // Auto-generate compare pairs for top 50 coins (~1,225 URLs)
    const top50 = coins.slice(0, 50);
    for (let i = 0; i < top50.length; i++) {
      for (let j = i + 1; j < top50.length; j++) {
        compareEntries.push({
          url: `https://tradepotion.com/compare/${top50[i].id}-vs-${top50[j].id}`,
          lastModified: now,
          changeFrequency: 'daily',
          priority: (i < 5 && j < 10) ? 0.7 : 0.5,
        });
      }
    }
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
