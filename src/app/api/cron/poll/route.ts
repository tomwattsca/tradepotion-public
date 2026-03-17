export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ensureSchema } from '@/lib/schema';
import { sendAlertEmail } from '@/lib/mailer';

// Protect this route — Railway cron passes the secret as a header
function isAuthorised(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // open in dev if not set
  const header = req.headers.get('x-cron-secret') ?? req.headers.get('authorization')?.replace('Bearer ', '');
  return header === secret;
}

async function fetchCoinGeckoMarkets(): Promise<CoinGeckoMarket[]> {
  const res = await fetch(
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h',
    { headers: { Accept: 'application/json' } }
  );
  if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);
  return res.json();
}

interface CoinGeckoMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_24h: number;
}

async function checkAndFireAlerts(markets: CoinGeckoMarket[]) {
  const priceMap = new Map(markets.map((c) => [c.id, c.current_price]));

  const alerts = await query<{
    id: string;
    email: string;
    coin_id: string;
    target_price: string;
    direction: 'above' | 'below';
  }>(`SELECT id, email, coin_id, target_price, direction FROM price_alerts WHERE triggered = FALSE`);

  for (const alert of alerts) {
    const currentPrice = priceMap.get(alert.coin_id);
    if (currentPrice === undefined) continue;

    const target = parseFloat(alert.target_price);
    const shouldFire =
      (alert.direction === 'above' && currentPrice >= target) ||
      (alert.direction === 'below' && currentPrice <= target);

    if (!shouldFire) continue;

    // Mark triggered first to avoid double-fire on error
    await query(
      `UPDATE price_alerts SET triggered = TRUE, triggered_at = NOW() WHERE id = $1`,
      [alert.id]
    );

    const coin = markets.find((c) => c.id === alert.coin_id);
    try {
      await sendAlertEmail({
        to: alert.email,
        coinName: coin?.name ?? alert.coin_id,
        coinSymbol: coin?.symbol ?? alert.coin_id,
        targetPrice: target,
        currentPrice,
        direction: alert.direction,
      });
      console.log(`[poll] Alert fired: ${alert.email} → ${alert.coin_id} ${alert.direction} $${target}`);
    } catch (err) {
      console.error(`[poll] Alert email failed for id=${alert.id}:`, err);
      // Don't un-trigger — avoid spam on email failures
    }
  }
}


// Fetch top 1000 coin IDs for sitemap — paginated across 4 CoinGecko pages
// Only runs once per hour to avoid rate limit pressure
async function refreshSitemapCache(): Promise<void> {
  try {
    // Check if we updated recently (within 55 minutes)
    const cached = await query<{ updated_at: Date }>('SELECT updated_at FROM sitemap_cache WHERE key = $1', ['top_coins']);
    if (cached.length > 0) {
      const ageMs = Date.now() - new Date(cached[0].updated_at).getTime();
      if (ageMs < 55 * 60 * 1000) return; // skip if updated <55 min ago
    }

    // Paginated fetch — 250 per page, 4 pages = 1000 coins, staggered to avoid 429
    const allIds: string[] = [];
    for (let page = 1; page <= 4; page++) {
      if (page > 1) await new Promise(r => setTimeout(r, 2000)); // 2s between pages
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=${page}&sparkline=false`,
          { headers: { Accept: 'application/json' } }
        );
        if (!res.ok) break; // 429 or error — use what we have
        const coins: { id: string }[] = await res.json();
        allIds.push(...coins.map(c => c.id));
      } catch {
        break;
      }
    }

    if (allIds.length > 0) {
      await query(
        `INSERT INTO sitemap_cache (key, coin_ids, updated_at)
         VALUES ('top_coins', $1, NOW())
         ON CONFLICT (key) DO UPDATE
           SET coin_ids = EXCLUDED.coin_ids, updated_at = EXCLUDED.updated_at`,
        [allIds]
      );
      console.log(`[sitemap-cache] Updated with ${allIds.length} coin IDs`);
    }
  } catch (err) {
    console.error('[sitemap-cache] Failed to refresh:', err);
  }
}

export async function GET(req: Request) {
  if (!isAuthorised(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureSchema();

    const markets = await fetchCoinGeckoMarkets();

    // Upsert coins
    for (const coin of markets) {
      await query(
        `INSERT INTO coins (id, slug, name, symbol, image_url)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE
           SET name = EXCLUDED.name,
               image_url = EXCLUDED.image_url`,
        [coin.id, coin.id, coin.name, coin.symbol, coin.image]
      );
    }


    // Refresh sitemap cache (top 1000 coins) if stale — runs inline but skips if updated <55min ago
    refreshSitemapCache().catch(err => console.error('[sitemap] refresh error:', err));



    // Bulk insert price snapshots
    const snapshotValues = markets
      .map((_, i) => {
        const base = i * 5;
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`;
      })
      .join(', ');

    const snapshotParams = markets.flatMap((c) => [
      c.id,
      c.current_price,
      c.market_cap,
      c.total_volume,
      c.price_change_24h,
    ]);

    await query(
      `INSERT INTO price_snapshots (coin_id, price_usd, market_cap, volume_24h, price_change_24h)
       VALUES ${snapshotValues}`,
      snapshotParams
    );

    // Check and fire alerts
    await checkAndFireAlerts(markets);

    return NextResponse.json({
      ok: true,
      polled: markets.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[poll] Error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
