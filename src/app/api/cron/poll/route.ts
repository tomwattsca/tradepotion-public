export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { coins, priceSnapshots, priceAlerts, sitemapCache } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';
import { runMigrations } from '@/lib/migrate';
import { sendAlertEmail } from '@/lib/mailer';

// Protect this route — Railway cron passes the secret as a header
function isAuthorised(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // open in dev if not set
  const header = req.headers.get('x-cron-secret') ?? req.headers.get('authorization')?.replace('Bearer ', '');
  return header === secret;
}

async function fetchCoinGeckoMarkets(): Promise<CoinGeckoMarket[]> {
  const apiKey = process.env.COINGECKO_API_KEY;
  const apiKeyParam = apiKey ? `&x_cg_pro_api_key=${apiKey}` : '';
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h${apiKeyParam}`,
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

  const alerts = await db
    .select({
      id: priceAlerts.id,
      email: priceAlerts.email,
      coinId: priceAlerts.coinId,
      targetPrice: priceAlerts.targetPrice,
      direction: priceAlerts.direction,
    })
    .from(priceAlerts)
    .where(eq(priceAlerts.triggered, false));

  for (const alert of alerts) {
    const currentPrice = priceMap.get(alert.coinId);
    if (currentPrice === undefined) continue;

    const target = parseFloat(alert.targetPrice!);
    const shouldFire =
      (alert.direction === 'above' && currentPrice >= target) ||
      (alert.direction === 'below' && currentPrice <= target);

    if (!shouldFire) continue;

    // Mark triggered first to avoid double-fire on error
    await db
      .update(priceAlerts)
      .set({ triggered: true, triggeredAt: new Date() })
      .where(eq(priceAlerts.id, alert.id));

    const coin = markets.find((c) => c.id === alert.coinId);
    try {
      await sendAlertEmail({
        to: alert.email,
        coinName: coin?.name ?? alert.coinId,
        coinSymbol: coin?.symbol ?? alert.coinId,
        targetPrice: target,
        currentPrice,
        direction: alert.direction as 'above' | 'below',
      });
      console.log(`[poll] Alert fired: ${alert.email} → ${alert.coinId} ${alert.direction} $${target}`);
    } catch (err) {
      console.error(`[poll] Alert email failed for id=${alert.id}:`, err);
    }
  }
}


// Fetch top 1000 coin IDs for sitemap — paginated across 4 CoinGecko pages
// Only runs once per hour to avoid rate limit pressure
async function refreshSitemapCache(): Promise<void> {
  try {
    // Check if we updated recently (within 55 minutes)
    const cached = await db
      .select({ updatedAt: sitemapCache.updatedAt })
      .from(sitemapCache)
      .where(eq(sitemapCache.key, 'top_coins'));

    if (cached.length > 0) {
      const ageMs = Date.now() - new Date(cached[0].updatedAt).getTime();
      if (ageMs < 55 * 60 * 1000) return; // skip if updated <55 min ago
    }

    // Paginated fetch — 250 per page, 4 pages = 1000 coins, staggered to avoid 429
    const apiKey = process.env.COINGECKO_API_KEY;
    const apiKeyParam = apiKey ? `&x_cg_pro_api_key=${apiKey}` : '';
    const allIds: string[] = [];
    for (let page = 1; page <= 4; page++) {
      if (page > 1) await new Promise(r => setTimeout(r, 2000)); // 2s between pages
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=${page}&sparkline=false${apiKeyParam}`,
          { headers: { Accept: 'application/json' } }
        );
        if (!res.ok) break; // 429 or error — use what we have
        const fetchedCoins: { id: string }[] = await res.json();
        allIds.push(...fetchedCoins.map(c => c.id));
      } catch {
        break;
      }
    }

    if (allIds.length > 0) {
      await db
        .insert(sitemapCache)
        .values({ key: 'top_coins', coinIds: allIds, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: sitemapCache.key,
          set: { coinIds: allIds, updatedAt: new Date() },
        });
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
    await runMigrations();

    const markets = await fetchCoinGeckoMarkets();

    // Upsert coins
    for (const coin of markets) {
      await db
        .insert(coins)
        .values({
          id: coin.id,
          slug: coin.id,
          name: coin.name,
          symbol: coin.symbol,
          imageUrl: coin.image,
        })
        .onConflictDoUpdate({
          target: coins.id,
          set: { name: coin.name, imageUrl: coin.image },
        });
    }

    // Refresh sitemap cache (top 1000 coins) if stale
    refreshSitemapCache().catch(err => console.error('[sitemap] refresh error:', err));

    // Bulk insert price snapshots
    await db.insert(priceSnapshots).values(
      markets.map((c) => ({
        coinId: c.id,
        priceUsd: String(c.current_price),
        marketCap: String(c.market_cap),
        volume24h: String(c.total_volume),
        priceChange24h: String(c.price_change_24h),
      }))
    );

    // Check and fire alerts
    await checkAndFireAlerts(markets);

    // Prune old snapshots — keep 90 days of history
    const retentionDays = parseInt(process.env.SNAPSHOT_RETENTION_DAYS || '90');
    const pruned = await db.execute<{ count: string }>(sql`
      WITH deleted AS (
        DELETE FROM price_snapshots
        WHERE captured_at < NOW() - MAKE_INTERVAL(days => ${retentionDays})
        RETURNING 1
      ) SELECT COUNT(*)::text AS count FROM deleted
    `);
    const prunedCount = parseInt(pruned.rows[0]?.count ?? '0');
    if (prunedCount > 0) {
      console.log(`[retention] Pruned ${prunedCount} snapshots older than ${retentionDays}d`);
    }

    return NextResponse.json({
      ok: true,
      polled: markets.length,
      pruned: prunedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[poll] Error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
