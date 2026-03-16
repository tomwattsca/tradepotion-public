const BASE_URL = 'https://api.coingecko.com/api/v3';

const DEFAULT_HEADERS = {
  'Accept': 'application/json',
};

async function fetchCG<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: DEFAULT_HEADERS,
    next: { revalidate: 300 }, // ISR — revalidate every 5 min (respect CoinGecko free tier)
  });

  if (!res.ok) {
    throw new Error(`CoinGecko API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export async function getTrendingCoins(limit = 20) {
  return fetchCG<import('@/types').Coin[]>('/coins/markets', {
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page: String(limit),
    page: '1',
    sparkline: 'false',
  });
}

export async function getTopGainers(limit = 10) {
  const coins = await fetchCG<import('@/types').Coin[]>('/coins/markets', {
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page: '250',
    page: '1',
    sparkline: 'false',
    price_change_percentage: '24h',
  });
  return coins
    .filter((c) => c.price_change_percentage_24h > 0)
    .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
    .slice(0, limit);
}

export async function getTopLosers(limit = 10) {
  const coins = await fetchCG<import('@/types').Coin[]>('/coins/markets', {
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page: '250',
    page: '1',
    sparkline: 'false',
    price_change_percentage: '24h',
  });
  return coins
    .filter((c) => c.price_change_percentage_24h < 0)
    .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
    .slice(0, limit);
}

export async function getCoinDetail(id: string) {
  return fetchCG<import('@/types').CoinDetail>(`/coins/${id}`, {
    localization: 'false',
    tickers: 'false',
    market_data: 'true',
    community_data: 'false',
    developer_data: 'false',
    sparkline: 'false',
  });
}

export async function getCoinMarketChart(id: string, days: string) {
  return fetchCG<import('@/types').MarketChartData>(`/coins/${id}/market_chart`, {
    vs_currency: 'usd',
    days,
  });
}

export async function getCategories() {
  return fetchCG<import('@/types').Category[]>('/coins/categories', {});
}

export async function getCoinsByCategory(categoryId: string, limit = 50) {
  return fetchCG<import('@/types').Coin[]>('/coins/markets', {
    vs_currency: 'usd',
    category: categoryId,
    order: 'market_cap_desc',
    per_page: String(limit),
    page: '1',
    sparkline: 'false',
  });
}

export async function searchCoins(query: string) {
  const res = await fetchCG<{
    coins: { id: string; name: string; symbol: string; thumb: string; market_cap_rank: number }[];
  }>('/search', { query });
  return res.coins.slice(0, 20);
}
