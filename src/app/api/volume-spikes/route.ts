import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const runtime = 'nodejs';
export const revalidate = 600; // 10 min — matches poll interval

export interface VolumeSpikeEntry {
  id: string;
  name: string;
  symbol: string;
  image_url: string;
  current_price: number;
  market_cap: number;
  current_volume: number;
  avg_30d_volume: number | null;
  spike_ratio: number | null;
  price_change_24h: number;
  days_of_data: number;
}

export async function GET() {
  try {
    const rows = await query<VolumeSpikeEntry>(`
      WITH daily_vol AS (
        SELECT 
          coin_id,
          DATE(captured_at) AS snap_date,
          AVG(volume_24h) AS avg_vol_that_day
        FROM price_snapshots
        GROUP BY coin_id, DATE(captured_at)
      ),
      latest_snap AS (
        SELECT DISTINCT ON (coin_id)
          coin_id,
          volume_24h   AS current_volume,
          price_usd    AS current_price,
          market_cap,
          price_change_24h
        FROM price_snapshots
        ORDER BY coin_id, captured_at DESC
      ),
      historical_avg AS (
        SELECT 
          coin_id,
          AVG(avg_vol_that_day)   AS avg_30d_volume,
          COUNT(DISTINCT snap_date) AS days_of_data
        FROM daily_vol
        WHERE snap_date < CURRENT_DATE
        GROUP BY coin_id
      )
      SELECT
        c.id,
        c.name,
        c.symbol,
        c.image_url,
        ls.current_price::float,
        ls.market_cap::float,
        ls.current_volume::float,
        ls.price_change_24h::float,
        ha.avg_30d_volume::float,
        ROUND((ls.current_volume / NULLIF(ha.avg_30d_volume, 0))::numeric, 2)::float AS spike_ratio,
        COALESCE(ha.days_of_data, 0)::int AS days_of_data
      FROM latest_snap ls
      JOIN coins c ON c.id = ls.coin_id
      LEFT JOIN historical_avg ha ON ha.coin_id = ls.coin_id
      ORDER BY spike_ratio DESC NULLS LAST, ls.current_volume DESC
      LIMIT 50
    `);

    const daysAvailable = rows.length > 0 ? rows[0].days_of_data : 0;

    return NextResponse.json({
      coins: rows,
      days_of_data: daysAvailable,
      has_historical: daysAvailable >= 3,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[volume-spikes]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
