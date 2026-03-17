import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const runtime = 'nodejs';
export const revalidate = 600; // 10 min cache

interface DbCoin {
  id: string;
  name: string;
  symbol: string;
  image_url: string;
  current_price: number;
  market_cap: number;
  volume_24h: number;
  price_change_24h: number;
  first_seen: string;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

  try {
    // Coins whose first price snapshot appeared in the last 30 days, ordered by most recent first
    const rows = await query<DbCoin>(`
      WITH first_seen AS (
        SELECT coin_id, MIN(captured_at) AS first_seen
        FROM price_snapshots
        GROUP BY coin_id
      ),
      latest AS (
        SELECT DISTINCT ON (coin_id)
          coin_id, price_usd, market_cap, volume_24h, price_change_24h
        FROM price_snapshots
        ORDER BY coin_id, captured_at DESC
      )
      SELECT
        c.id,
        c.name,
        c.symbol,
        c.image_url,
        l.price_usd   AS current_price,
        l.market_cap,
        l.volume_24h,
        l.price_change_24h,
        f.first_seen::text
      FROM first_seen f
      JOIN latest l ON l.coin_id = f.coin_id
      JOIN coins c ON c.id = f.coin_id
      WHERE f.first_seen >= NOW() - INTERVAL '30 days'
      ORDER BY f.first_seen DESC
      LIMIT $1
    `, [limit]);

    return NextResponse.json({
      coins: rows.map((r, i) => ({ ...r, listing_rank: i + 1 })),
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    // Fallback: return empty with error detail so the UI can show a friendly message
    console.error('new-listings DB error:', err);
    return NextResponse.json({ error: String(err), coins: [] }, { status: 500 });
  }
}
