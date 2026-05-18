import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { calculatePctChangeFromAbsolute } from '@/lib/coingecko';
import type { Coin } from '@/types';

interface CachedWatchlistCoinRow {
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

const COINGECKO_HEADERS: Record<string, string> = {
  Accept: 'application/json',
  ...(process.env.COINGECKO_API_KEY
    ? { 'x-cg-demo-api-key': process.env.COINGECKO_API_KEY }
    : {}),
};

function toNumber(value: string | number | null | undefined): number {
  const parsed = typeof value === 'number' ? value : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapCachedWatchlistRow(row: CachedWatchlistCoinRow, rank: number): Coin {
  const currentPrice = toNumber(row.price_usd);
  const absoluteChange = toNumber(row.price_change_24h);

  return {
    id: row.slug || row.id,
    symbol: row.symbol,
    name: row.name,
    image: row.image_url || '/favicon.ico',
    current_price: currentPrice,
    market_cap: toNumber(row.market_cap),
    market_cap_rank: rank,
    fully_diluted_valuation: null,
    total_volume: toNumber(row.volume_24h),
    high_24h: 0,
    low_24h: 0,
    price_change_24h: absoluteChange,
    price_change_percentage_24h: calculatePctChangeFromAbsolute(currentPrice, absoluteChange),
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
  };
}

async function getCachedWatchlistCoins(idList: string[]): Promise<Coin[]> {
  if (idList.length === 0) return [];

  const rows = await query<CachedWatchlistCoinRow>(
    `
      SELECT DISTINCT ON (c.slug)
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
      WHERE c.slug = ANY($1::text[])
      ORDER BY c.slug, ps.captured_at DESC
    `,
    [idList]
  );

  const byId = new Map(rows.map((row) => [row.slug, row]));
  return idList
    .map((id, index) => {
      const row = byId.get(id);
      return row ? mapCachedWatchlistRow(row, index + 1) : null;
    })
    .filter((coin): coin is Coin => Boolean(coin));
}

export async function GET(request: NextRequest) {
  const ids = request.nextUrl.searchParams.get('ids') ?? '';
  const idList = ids.split(',').map(s => s.trim()).filter(Boolean).slice(0, 50);

  if (idList.length === 0) return NextResponse.json([]);

  try {
    const url = new URL('https://api.coingecko.com/api/v3/coins/markets');
    url.searchParams.set('vs_currency', 'usd');
    url.searchParams.set('ids', idList.join(','));
    url.searchParams.set('order', 'market_cap_desc');
    url.searchParams.set('sparkline', 'true');
    url.searchParams.set('price_change_percentage', '7d');

    const res = await fetch(url.toString(), {
      headers: COINGECKO_HEADERS,
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn('[api/coins/batch] CoinGecko unavailable, trying cached DB fallback:', err);
    try {
      const cachedCoins = await getCachedWatchlistCoins(idList);
      return NextResponse.json(cachedCoins, {
        headers: { 'x-tradepotion-coins-source': 'cached-db' },
      });
    } catch (fallbackErr) {
      console.error('[api/coins/batch] cached fallback error:', fallbackErr);
      return NextResponse.json({ error: 'Failed to fetch coin data' }, { status: 500 });
    }
  }
}
