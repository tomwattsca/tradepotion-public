import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { getCoinMarketChart } from '@/lib/coingecko';

const getCachedChart = (coinId: string, days: string) =>
  unstable_cache(
    async () => {
      const data = await getCoinMarketChart(coinId, days);
      return data;
    },
    ['chart', coinId, days],
    { revalidate: 300 } // 5 min server-side cache
  )();

export async function GET(
  request: NextRequest,
  { params }: { params: { coinId: string } }
) {
  const days = request.nextUrl.searchParams.get('days') ?? '7';
  try {
    const data = await getCachedChart(params.coinId, days);
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (err) {
    const msg = String(err);
    // Propagate rate-limit status so client can distinguish transient from permanent errors
    const status = msg.includes('429') ? 429 : 500;
    return NextResponse.json(
      { error: 'Chart data temporarily unavailable', retryAfter: 60 },
      { status, headers: { 'Retry-After': '60' } }
    );
  }
}
