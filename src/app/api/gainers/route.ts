import { NextResponse } from 'next/server';
import { getCachedTopCoins } from '@/lib/coingecko';

export const runtime = 'nodejs';

// In-process stale cache for gainers/losers data
const _cache = new Map<string, { data: unknown; ts: number }>();
const FRESH_MS = 5 * 60 * 1000;   // 5 min fresh
const STALE_MS = 30 * 60 * 1000;  // 30 min stale fallback

interface CoinGeckoMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_24h_in_currency?: number;
  price_change_percentage_7d_in_currency?: number;
  sparkline_in_7d?: { price: number[] };
}

async function fetchMarkets(): Promise<{ coins: CoinGeckoMarket[]; fetchedAt: number }> {
  const CACHE_KEY = 'markets-250';
  const cached = _cache.get(CACHE_KEY);
  const now = Date.now();

  if (cached && now - cached.ts < FRESH_MS) {
    return { coins: cached.data as CoinGeckoMarket[], fetchedAt: cached.ts };
  }

  let lastErr: unknown;
  for (let attempt = 0; attempt <= 3; attempt++) {
    try {
      if (attempt > 0) await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt - 1)));

      const url = new URL('https://api.coingecko.com/api/v3/coins/markets');
      url.searchParams.set('vs_currency', 'usd');
      url.searchParams.set('order', 'market_cap_desc');
      url.searchParams.set('per_page', '250');
      url.searchParams.set('page', '1');
      url.searchParams.set('sparkline', 'true');
      url.searchParams.set('price_change_percentage', '1h,24h,7d');

      const headers: Record<string, string> = { Accept: 'application/json' };
      if (process.env.COINGECKO_API_KEY) headers['x-cg-demo-api-key'] = process.env.COINGECKO_API_KEY;

      const res = await fetch(url.toString(), {
        headers,
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
      const data: CoinGeckoMarket[] = await res.json();
      _cache.set(CACHE_KEY, { data, ts: now });
      return { coins: data, fetchedAt: now };
    } catch (err) {
      lastErr = err;
    }
  }

  // Stale fallback
  if (cached && now - cached.ts < STALE_MS) {
    console.warn(`[gainers] Serving stale cache (${Math.round((now - cached.ts) / 60000)}min old)`);
    return { coins: cached.data as CoinGeckoMarket[], fetchedAt: cached.ts };
  }

  try {
    const fallbackCoins = await getCachedTopCoins(250);
    if (fallbackCoins.length > 0) {
      const fallbackMarkets = fallbackCoins.map((coin): CoinGeckoMarket => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        image: coin.image,
        current_price: coin.current_price,
        market_cap: coin.market_cap,
        total_volume: coin.total_volume,
        price_change_percentage_24h_in_currency: coin.price_change_percentage_24h,
        price_change_percentage_7d_in_currency: coin.price_change_percentage_7d_in_currency,
        sparkline_in_7d: coin.sparkline_in_7d,
      }));
      _cache.set(CACHE_KEY, { data: fallbackMarkets, ts: now });
      console.warn('[gainers] Serving cached public market snapshot fallback after live market fetch failed');
      return { coins: fallbackMarkets, fetchedAt: now };
    }
  } catch (fallbackErr) {
    console.warn('[gainers] Cached public market fallback unavailable', fallbackErr);
  }

  throw lastErr;
}

function getPct(coin: CoinGeckoMarket, range: string): number {
  switch (range) {
    case '1h':  return coin.price_change_percentage_1h_in_currency ?? 0;
    case '4h':  return coin.price_change_percentage_1h_in_currency ?? 0;
    case '24h': return coin.price_change_percentage_24h_in_currency ?? 0;
    case '7d':  return coin.price_change_percentage_7d_in_currency ?? 0;
    default:    return coin.price_change_percentage_24h_in_currency ?? 0;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const range = searchParams.get('range') || '24h';
  const type = searchParams.get('type') || 'gainers';
  const limit = parseInt(searchParams.get('limit') || '250');
  const minVolume = parseInt(searchParams.get('minVol') || '0');

  try {
    const { coins, fetchedAt } = await fetchMarkets();

    const filtered = coins
      .filter(c => c.total_volume >= minVolume)
      .map(c => ({ ...c, pct: getPct(c, range) }))
      .filter(c => type === 'gainers' ? c.pct > 0 : c.pct < 0)
      .sort((a, b) => type === 'gainers' ? b.pct - a.pct : a.pct - b.pct)
      .slice(0, limit);

    const isStale = Date.now() - fetchedAt > FRESH_MS;

    return NextResponse.json({
      range,
      type,
      coins: filtered,
      fetchedAt,
      isStale,
      note: range === '4h' ? '4h approximated from 1h data (CoinGecko free tier)' : undefined,
      generated_at: new Date(fetchedAt).toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
