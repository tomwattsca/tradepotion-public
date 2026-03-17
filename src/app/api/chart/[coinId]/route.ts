import { NextRequest, NextResponse } from 'next/server';
import { getCoinMarketChart } from '@/lib/coingecko';

// Simple in-process TTL cache — survives CoinGecko rate limit cooldowns
const cache = new Map<string, { data: unknown; expiresAt: number }>();
const TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCached(key: string): unknown | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { cache.delete(key); return null; }
  return entry.data;
}

function setCached(key: string, data: unknown): void {
  cache.set(key, { data, expiresAt: Date.now() + TTL_MS });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { coinId: string } }
) {
  const days = request.nextUrl.searchParams.get('days') ?? '7';
  const key = `chart:${params.coinId}:${days}`;

  const cached = getCached(key);
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Cache': 'HIT',
      },
    });
  }

  try {
    const data = await getCoinMarketChart(params.coinId, days);
    setCached(key, data);
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Cache': 'MISS',
      },
    });
  } catch (err) {
    const msg = String(err);
    const status = msg.includes('429') ? 429 : 500;
    return NextResponse.json(
      { error: 'Chart data temporarily unavailable', retryAfter: 60 },
      { status, headers: { 'Retry-After': '60' } }
    );
  }
}
