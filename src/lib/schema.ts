import { query } from './db';

export async function ensureSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS coins (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      symbol TEXT NOT NULL,
      image_url TEXT
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS price_snapshots (
      id BIGSERIAL PRIMARY KEY,
      coin_id TEXT NOT NULL REFERENCES coins(id) ON DELETE CASCADE,
      price_usd NUMERIC NOT NULL,
      market_cap NUMERIC,
      volume_24h NUMERIC,
      price_change_24h NUMERIC,
      captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_snapshots_coin_captured
    ON price_snapshots (coin_id, captured_at DESC)
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS price_alerts (
      id BIGSERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      coin_id TEXT NOT NULL,
      target_price NUMERIC NOT NULL,
      direction TEXT NOT NULL CHECK (direction IN ('above', 'below')),
      triggered BOOLEAN NOT NULL DEFAULT FALSE,
      triggered_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS sitemap_cache (
      key TEXT PRIMARY KEY,
      coin_ids TEXT[] NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id BIGSERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
      unsubscribe_token TEXT UNIQUE NOT NULL,
      subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      unsubscribed_at TIMESTAMPTZ
    )
  `);
}
