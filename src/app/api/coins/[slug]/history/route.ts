import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { priceSnapshots } from '@/lib/schema';
import { eq, gte, asc, sql } from 'drizzle-orm';
import { getCoinMarketChart } from '@/lib/coingecko';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const hours = parseInt(req.nextUrl.searchParams.get('hours') ?? '24', 10);
  const days = Math.max(1, Math.ceil(hours / 24));

  // Try DB first
  try {
    const rows = await db
      .select({
        capturedAt: priceSnapshots.capturedAt,
        priceUsd: priceSnapshots.priceUsd,
      })
      .from(priceSnapshots)
      .where(
        sql`${priceSnapshots.coinId} = ${params.slug} AND ${priceSnapshots.capturedAt} >= NOW() - ${`${hours} hours`}::interval`
      )
      .orderBy(asc(priceSnapshots.capturedAt));

    if (rows.length >= 2) {
      const prices: [number, number][] = rows.map((r) => [
        new Date(r.capturedAt).getTime(),
        parseFloat(r.priceUsd!),
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
