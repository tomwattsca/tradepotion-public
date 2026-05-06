CREATE TABLE "coins" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"symbol" text NOT NULL,
	"image_url" text,
	CONSTRAINT "coins_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "price_alerts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"coin_id" text NOT NULL,
	"target_price" numeric NOT NULL,
	"direction" text NOT NULL,
	"triggered" boolean DEFAULT false NOT NULL,
	"triggered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "price_snapshots" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"coin_id" text NOT NULL,
	"price_usd" numeric NOT NULL,
	"market_cap" numeric,
	"volume_24h" numeric,
	"price_change_24h" numeric,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sitemap_cache" (
	"key" text PRIMARY KEY NOT NULL,
	"coin_ids" text[] NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "price_snapshots" ADD CONSTRAINT "price_snapshots_coin_id_coins_id_fk" FOREIGN KEY ("coin_id") REFERENCES "public"."coins"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_snapshots_coin_captured" ON "price_snapshots" USING btree ("coin_id","captured_at");