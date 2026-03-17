import { NextRequest, NextResponse } from 'next/server';
import { getCoinMarketChart } from '@/lib/coingecko';

// Shared in-process stale cache — survives CoinGecko 429s
// Key: coinId:days → { data, storedAt }
const staleCache = new Map<string, { data: unknown; storedAt: number }>();
const FRESH_TTL = 5 * 60 * 1000;   // 5 min — serve fresh
const STALE_TTL = 60 * 60 * 1000;  // 60 min — serve stale on error

function getStale(key: string): unknown | null {
  const entry = staleCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.storedAt > STALE_TTL) { staleCache.delete(key); return null; }
  return entry.data;
}

function isFresh(key: string): boolean {
  const entry = staleCache.get(key);
  return !!entry && Date.now() - entry.storedAt < FRESH_TTL;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { coinId: string } }
) {
  const days = request.nextUrl.searchParams.get('days') ?? '7';
  const key = `${params.coinId}:${days}`;

  // Serve fresh cache
  if (isFresh(key)) {
    return NextResponse.json(staleCache.get(key)!.data, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', 'X-Cache': 'HIT' },
    });
  }

  try {
    const data = await getCoinMarketChart(params.coinId, days);
    staleCache.set(key, { data, storedAt: Date.now() });
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', 'X-Cache': 'MISS' },
    });
  } catch (err) {
    // On error, serve stale if available — better than blank chart
    const stale = getStale(key);
    if (stale) {
      return NextResponse.json(stale, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          'X-Cache': 'STALE',
          'X-Stale-Reason': String(err).includes('429') ? 'rate-limited' : 'error',
        },
      });
    }
    const status = String(err).includes('429') ? 429 : 500;
    return NextResponse.json(
      { error: 'Chart data temporarily unavailable', retryAfter: 60 },
      { status, headers: { 'Retry-After': '60' } }
    );
  }
}
