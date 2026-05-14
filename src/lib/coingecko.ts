import { query } from '@/lib/db';
import type { Coin } from '@/types';

const BASE_URL = 'https://api.coingecko.com/api/v3';

const DEFAULT_HEADERS: Record<string, string> = {
  'Accept': 'application/json',
  // Demo API key — raises free tier rate limit from 30 to 50 req/min
  // Get your own free key at https://www.coingecko.com/en/api/pricing
  ...(process.env.COINGECKO_API_KEY
    ? { 'x-cg-demo-api-key': process.env.COINGECKO_API_KEY }
    : {}),
};

// In-process stale cache — survives CoinGecko rate-limit windows
const _cgCache = new Map<string, { data: unknown; ts: number }>();
const CG_CACHE_TTL_MS = 5 * 60 * 1000; // 5 min fresh window
const CG_STALE_TTL_MS = 30 * 60 * 1000; // 30 min stale-while-unavailable window

async function fetchCG<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const cacheKey = url.toString();

  const cached = _cgCache.get(cacheKey);
  const now = Date.now();

  // Serve fresh cache immediately
  if (cached && now - cached.ts < CG_CACHE_TTL_MS) {
    return cached.data as T;
  }

  // Try to fetch with 3x retry + exponential backoff
  let lastError: unknown;
  for (let attempt = 0; attempt <= 3; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt - 1)));
      }
      const res = await fetch(url.toString(), {
        headers: DEFAULT_HEADERS,
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(10_000), // 10s hard timeout
      });
      if (!res.ok) throw new Error(`CoinGecko API error: ${res.status} ${res.statusText}`);
      const data = await res.json() as T;
      _cgCache.set(cacheKey, { data, ts: now });
      return data;
    } catch (err) {
      lastError = err;
    }
  }

  // All retries exhausted — serve stale cache if within stale window
  if (cached && now - cached.ts < CG_STALE_TTL_MS) {
    console.warn(`[CoinGecko] Serving stale cache for ${path} (${Math.round((now - cached.ts) / 60000)}min old)`);
    return cached.data as T;
  }

  throw lastError;
}


// CoinGecko upstream category errors — filtered from display to protect credibility
const CATEGORY_GLOBAL_BLOCKLIST = new Set([
  'FTX Holdings', // Stale/defunct exchange tag
]);

// Per-coin overrides for factually wrong CoinGecko tags
const COIN_CATEGORY_BLOCKLIST: Record<string, Set<string>> = {
  bitcoin:       new Set(['Smart Contract Platform', 'FTX Holdings']),
  litecoin:      new Set(['Smart Contract Platform']),
  dogecoin:      new Set(['Smart Contract Platform']),
  'bitcoin-cash': new Set(['Smart Contract Platform']),
  'bitcoin-sv':  new Set(['Smart Contract Platform']),
};

export function filterCategories(coinId: string, categories: string[]): string[] {
  const perCoin = COIN_CATEGORY_BLOCKLIST[coinId] ?? new Set<string>();
  return categories.filter(cat => !CATEGORY_GLOBAL_BLOCKLIST.has(cat) && !perCoin.has(cat));
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
    sparkline: 'true',
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
    sparkline: 'true',
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

export interface GlobalMarketData {
  active_cryptocurrencies: number;
  total_market_cap: { usd: number };
  total_volume: { usd: number };
  market_cap_percentage: { btc: number; eth: number };
  market_cap_change_percentage_24h_usd: number;
}

export async function getGlobalMarketData(): Promise<GlobalMarketData> {
  const res = await fetchCG<{ data: GlobalMarketData }>('/global', {});
  return (res as unknown as { data: GlobalMarketData }).data;
}

export async function getTopCoins(limit = 100, page = 1) {
  return fetchCG<import('@/types').Coin[]>('/coins/markets', {
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page: String(Math.min(limit, 250)),
    page: String(page),
    sparkline: 'true',
    price_change_percentage: '1h,7d',
  });
}

export async function getMultipleCoins(ids: string[]) {
  return fetchCG<import('@/types').Coin[]>('/coins/markets', {
    vs_currency: 'usd',
    ids: ids.join(','),
    order: 'market_cap_desc',
    per_page: '10',
    page: '1',
    sparkline: 'false',
    price_change_percentage: '7d,30d',
  });
}


interface CachedMarketCoinRow {
  id: string;
  slug: string;
  name: string;
  symbol: string;
  image_url: string | null;
  price_usd: string | number | null;
  market_cap: string | number | null;
  volume_24h: string | number | null;
  price_change_24h: string | number | null;
  captured_at: Date | string | null;
}

function toNumber(value: string | number | null | undefined): number {
  const parsed = typeof value === 'number' ? value : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function getCachedTopCoins(limit = 100): Promise<Coin[]> {
  const rows = await query<CachedMarketCoinRow>(`
    SELECT DISTINCT ON (c.id)
      c.id,
      c.slug,
      c.name,
      c.symbol,
      c.image_url,
      ps.price_usd,
      ps.market_cap,
      ps.volume_24h,
      ps.price_change_24h,
      ps.captured_at
    FROM coins c
    JOIN price_snapshots ps ON ps.coin_id = c.id
    WHERE ps.price_usd IS NOT NULL
    ORDER BY c.id, ps.captured_at DESC
  `);

  return rows
    .map((row) => ({
      id: row.slug || row.id,
      symbol: row.symbol,
      name: row.name,
      image: row.image_url || '/favicon.ico',
      current_price: toNumber(row.price_usd),
      market_cap: toNumber(row.market_cap),
      market_cap_rank: 0,
      fully_diluted_valuation: null,
      total_volume: toNumber(row.volume_24h),
      high_24h: 0,
      low_24h: 0,
      price_change_24h: 0,
      price_change_percentage_24h: toNumber(row.price_change_24h),
      market_cap_change_24h: 0,
      market_cap_change_percentage_24h: 0,
      circulating_supply: 0,
      total_supply: null,
      max_supply: null,
      ath: 0,
      ath_change_percentage: 0,
      ath_date: '',
      atl: 0,
      atl_change_percentage: 0,
      atl_date: '',
      last_updated: row.captured_at ? new Date(row.captured_at).toISOString() : '',
      sparkline_in_7d: { price: [] },
    }))
    .sort((a, b) => b.market_cap - a.market_cap)
    .slice(0, limit)
    .map((coin, index) => ({ ...coin, market_cap_rank: index + 1 }));
}
