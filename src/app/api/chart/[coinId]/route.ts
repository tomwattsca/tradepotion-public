import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { getCoinMarketChart } from '@/lib/coingecko';

const getCachedChart = (coinId: string, days: string) =>
  unstable_cache(
    () => getCoinMarketChart(coinId, days),
    ['chart', coinId, days],
    { revalidate: 300 } // 5 min server-side cache — respects CoinGecko free tier
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
  } catch {
    return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 });
  }
}
