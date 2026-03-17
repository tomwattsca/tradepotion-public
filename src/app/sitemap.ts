import { MetadataRoute } from 'next';
import { getCategories } from '@/lib/coingecko';

export const revalidate = 3600; // regenerate every hour

// CoinGecko free tier: max 250 per page, stagger calls to avoid 429
async function fetchCoinPage(page: number): Promise<{ id: string; market_cap_rank: number }[]> {
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=${page}&sparkline=false`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

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

  // Fetch top 1,000 coins across 4 pages with staggered timing
  const [page1, , page2, , page3, , page4] = await Promise.all([
    fetchCoinPage(1),
    new Promise(r => setTimeout(r, 500)),
    fetchCoinPage(2),
    new Promise(r => setTimeout(r, 1000)),
    fetchCoinPage(3),
    new Promise(r => setTimeout(r, 1500)),
    fetchCoinPage(4),
  ]) as [
    { id: string; market_cap_rank: number }[],
    unknown,
    { id: string; market_cap_rank: number }[],
    unknown,
    { id: string; market_cap_rank: number }[],
    unknown,
    { id: string; market_cap_rank: number }[],
  ];

  const allCoins = [...page1, ...page2, ...page3, ...page4];

  const coinEntries: MetadataRoute.Sitemap = allCoins.map((coin) => ({
    url: `https://tradepotion.com/coins/${coin.id}`,
    lastModified: now,
    changeFrequency: 'hourly',
    priority: coin.market_cap_rank <= 10 ? 0.95
      : coin.market_cap_rank <= 100 ? 0.9
      : coin.market_cap_rank <= 500 ? 0.8
      : 0.7,
  }));

  // Category pages
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

  // Top 50 curated compare pairs — high search volume, indexed individually
  const compareEntries: MetadataRoute.Sitemap = TOP_COMPARE_PAIRS.map((pair) => ({
    url: `https://tradepotion.com/compare/${pair}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: pair.includes('bitcoin') || pair.includes('ethereum') ? 0.85 : 0.75,
  }));

  // Auto-generate additional compare pairs from top 20 coins (~190 more URLs)
  const top20 = allCoins.slice(0, 20);
  const autoPairs = new Set(TOP_COMPARE_PAIRS);
  const autoCompareEntries: MetadataRoute.Sitemap = [];
  for (let i = 0; i < top20.length; i++) {
    for (let j = i + 1; j < top20.length; j++) {
      const pair = `${top20[i].id}-vs-${top20[j].id}`;
      if (!autoPairs.has(pair)) {
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
    ...autoCompareEntries,
  ];
}
