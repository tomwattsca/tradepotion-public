import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCoinMarketChart } from '@/lib/coingecko';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const hours = parseInt(req.nextUrl.searchParams.get('hours') ?? '24', 10);
  const days = Math.max(1, Math.ceil(hours / 24));

  // Try DB first
  try {
    const rows = await query<{ captured_at: string; price_usd: string }>(
      `SELECT captured_at, price_usd
       FROM price_snapshots
       WHERE coin_id = $1
         AND captured_at >= NOW() - $2::interval
       ORDER BY captured_at ASC`,
      [params.slug, `${hours} hours`]
    );

    if (rows.length >= 2) {
      const prices: [number, number][] = rows.map((r) => [
        new Date(r.captured_at).getTime(),
        parseFloat(r.price_usd),
      ]);
      return NextResponse.json({ prices });
    }
  } catch {
    // DB not available — fall through to CoinGecko
  }

  // Fallback to CoinGecko
  try {
    const data = await getCoinMarketChart(params.slug, String(days));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
