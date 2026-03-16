import { NextRequest, NextResponse } from 'next/server';
import { getCoinMarketChart } from '@/lib/coingecko';

export async function GET(
  request: NextRequest,
  { params }: { params: { coinId: string } }
) {
  const days = request.nextUrl.searchParams.get('days') ?? '7';
  try {
    const data = await getCoinMarketChart(params.coinId, days);
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 });
  }
}
