import {
  pgTable,
  text,
  bigserial,
  numeric,
  timestamp,
  boolean,
  index,
} from 'drizzle-orm/pg-core';

export const coins = pgTable('coins', {
  id: text('id').primaryKey(),
  slug: text('slug').unique().notNull(),
  name: text('name').notNull(),
  symbol: text('symbol').notNull(),
  imageUrl: text('image_url'),
});

export const priceSnapshots = pgTable(
  'price_snapshots',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    coinId: text('coin_id')
      .notNull()
      .references(() => coins.id, { onDelete: 'cascade' }),
    priceUsd: numeric('price_usd').notNull(),
    marketCap: numeric('market_cap'),
    volume24h: numeric('volume_24h'),
    priceChange24h: numeric('price_change_24h'),
    capturedAt: timestamp('captured_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_snapshots_coin_captured').on(table.coinId, table.capturedAt),
  ]
);

export const priceAlerts = pgTable('price_alerts', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  email: text('email').notNull(),
  coinId: text('coin_id').notNull(),
  targetPrice: numeric('target_price').notNull(),
  direction: text('direction').notNull(),
  triggered: boolean('triggered').notNull().default(false),
  triggeredAt: timestamp('triggered_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sitemapCache = pgTable('sitemap_cache', {
  key: text('key').primaryKey(),
  coinIds: text('coin_ids').array().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
