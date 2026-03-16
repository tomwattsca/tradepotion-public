"""
CoinGecko polling service.
Runs every POLL_INTERVAL_SECONDS (default 300s / 5 min).
Strategy: fetch top 250 coins by market cap in one API call.
That's 1 call per poll cycle — well under free tier 30 req/min.
"""
import asyncio
import logging
import datetime
import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.database import AsyncSessionLocal
from app.models import Coin, PriceSnapshot
from app.services.coingecko import fetch_markets
from app.services.alerts import check_and_fire_alerts
from app.config import settings

logger = logging.getLogger(__name__)


async def run_poll_cycle():
    """
    Single poll cycle:
    1. Fetch top 250 coins from CoinGecko
    2. Upsert coin records
    3. Insert price snapshots
    4. Check and fire any triggered alerts
    """
    logger.info("Starting poll cycle...")
    start = datetime.datetime.utcnow()

    try:
        coins_data = await fetch_markets(per_page=250, page=1)
    except Exception as e:
        logger.error(f"CoinGecko fetch failed: {e}")
        return

    if not coins_data:
        logger.warning("Empty response from CoinGecko")
        return

    async with AsyncSessionLocal() as db:
        try:
            await _upsert_coins(db, coins_data)
            await _insert_snapshots(db, coins_data)
            await db.commit()

            # Check alerts for each coin
            alert_count = 0
            for coin in coins_data:
                price = coin.get("current_price")
                if price is not None:
                    fired = await check_and_fire_alerts(db, coin["id"], price)
                    alert_count += fired

            elapsed = (datetime.datetime.utcnow() - start).total_seconds()
            logger.info(
                f"Poll cycle complete: {len(coins_data)} coins, "
                f"{alert_count} alerts fired, {elapsed:.1f}s elapsed"
            )
        except Exception as e:
            await db.rollback()
            logger.error(f"Poll cycle DB error: {e}", exc_info=True)


async def _upsert_coins(db: AsyncSession, coins_data: list[dict]):
    """Upsert coin records — update name/symbol/image if changed."""
    for coin in coins_data:
        stmt = pg_insert(Coin).values(
            id=coin["id"],
            slug=coin["id"],
            name=coin["name"],
            symbol=coin["symbol"],
            image_url=coin.get("image"),
            category_ids=None,
            updated_at=datetime.datetime.utcnow(),
        ).on_conflict_do_update(
            index_elements=["id"],
            set_={
                "name": coin["name"],
                "symbol": coin["symbol"],
                "image_url": coin.get("image"),
                "updated_at": datetime.datetime.utcnow(),
            }
        )
        await db.execute(stmt)


async def _insert_snapshots(db: AsyncSession, coins_data: list[dict]):
    """Bulk insert price snapshots."""
    now = datetime.datetime.utcnow()
    snapshots = []
    for coin in coins_data:
        price = coin.get("current_price")
        if price is None:
            continue
        snapshots.append({
            "coin_id": coin["id"],
            "price_usd": price,
            "market_cap": coin.get("market_cap"),
            "volume_24h": coin.get("total_volume"),
            "price_change_24h": coin.get("price_change_percentage_24h"),
            "captured_at": now,
        })

    if snapshots:
        await db.execute(PriceSnapshot.__table__.insert(), snapshots)


def start_scheduler():
    """
    Start the APScheduler background scheduler.
    Called once at app startup.
    """
    from apscheduler.schedulers.asyncio import AsyncIOScheduler

    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        run_poll_cycle,
        "interval",
        seconds=settings.POLL_INTERVAL_SECONDS,
        id="coingecko_poll",
        replace_existing=True,
        max_instances=1,
        misfire_grace_time=60,
    )
    scheduler.start()
    logger.info(
        f"Poller scheduler started — interval: {settings.POLL_INTERVAL_SECONDS}s"
    )
    return scheduler
