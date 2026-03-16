import { NextRequest, NextResponse } from 'next/server';
import { searchCoins } from '@/lib/coingecko';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? '';
  if (!q.trim()) return NextResponse.json([]);
  try {
    const results = await searchCoins(q);
    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
