import { NextRequest, NextResponse } from 'next/server';

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
      headers: { Accept: 'application/json' },
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('[api/coins/batch] error:', err);
    return NextResponse.json({ error: 'Failed to fetch coin data' }, { status: 500 });
  }
}
