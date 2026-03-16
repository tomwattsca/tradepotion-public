"""
API routes for the tracker frontend to consume.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import Optional
import datetime

from app.database import get_db
from app.models import Coin, PriceSnapshot, PriceAlert
from app.schemas import (
    CoinOut, PriceSnapshotOut, AlertCreate, AlertOut, 
    CoinWithPrice, TrendingResponse
)
from app.services.poller import run_poll_cycle

router = APIRouter(prefix="/api", tags=["tracker"])


# ── Coins ────────────────────────────────────────────────────────────────────

@router.get("/coins", response_model=list[CoinWithPrice])
async def list_coins(
    limit: int = Query(100, le=250),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_db),
):
    """List coins with their latest price snapshot."""
    # Subquery: latest snapshot per coin
    latest_subq = (
        select(
            PriceSnapshot.coin_id,
            func.max(PriceSnapshot.captured_at).label("max_captured_at")
        )
        .group_by(PriceSnapshot.coin_id)
        .subquery()
    )
    latest_snap = (
        select(PriceSnapshot)
        .join(
            latest_subq,
            (PriceSnapshot.coin_id == latest_subq.c.coin_id) &
            (PriceSnapshot.captured_at == latest_subq.c.max_captured_at)
        )
        .subquery()
    )

    result = await db.execute(
        select(Coin, latest_snap)
        .outerjoin(latest_snap, Coin.id == latest_snap.c.coin_id)
        .order_by(desc(latest_snap.c.market_cap))
        .limit(limit)
        .offset(offset)
    )
    rows = result.all()

    out = []
    for row in rows:
        coin = row[0]
        snap = row[1:]
        out.append(CoinWithPrice(
            id=coin.id,
            slug=coin.slug,
            name=coin.name,
            symbol=coin.symbol,
            image_url=coin.image_url,
            price_usd=snap[2] if len(snap) > 2 else None,
            market_cap=snap[3] if len(snap) > 3 else None,
            volume_24h=snap[4] if len(snap) > 4 else None,
            price_change_24h=snap[5] if len(snap) > 5 else None,
        ))
    return out


@router.get("/coins/{slug}", response_model=CoinOut)
async def get_coin(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Coin).where(Coin.slug == slug))
    coin = result.scalar_one_or_none()
    if not coin:
        raise HTTPException(status_code=404, detail="Coin not found")
    return coin


@router.get("/coins/{slug}/history", response_model=list[PriceSnapshotOut])
async def get_coin_history(
    slug: str,
    hours: int = Query(24, description="Hours of history to return"),
    db: AsyncSession = Depends(get_db),
):
    """Return price history for a coin over the last N hours."""
    cutoff = datetime.datetime.utcnow() - datetime.timedelta(hours=hours)
    result = await db.execute(
        select(PriceSnapshot)
        .join(Coin, Coin.id == PriceSnapshot.coin_id)
        .where(Coin.slug == slug)
        .where(PriceSnapshot.captured_at >= cutoff)
        .order_by(PriceSnapshot.captured_at.asc())
    )
    return result.scalars().all()


@router.get("/trending", response_model=list[CoinWithPrice])
async def trending_coins(
    limit: int = Query(20, le=50),
    db: AsyncSession = Depends(get_db),
):
    """
    Top gainers by 24h price change from the latest poll snapshot.
    """
    latest_subq = (
        select(
            PriceSnapshot.coin_id,
            func.max(PriceSnapshot.captured_at).label("max_at")
        )
        .group_by(PriceSnapshot.coin_id)
        .subquery()
    )

    result = await db.execute(
        select(Coin, PriceSnapshot)
        .join(PriceSnapshot, Coin.id == PriceSnapshot.coin_id)
        .join(
            latest_subq,
            (PriceSnapshot.coin_id == latest_subq.c.coin_id) &
            (PriceSnapshot.captured_at == latest_subq.c.max_at)
        )
        .where(PriceSnapshot.price_change_24h.isnot(None))
        .order_by(desc(PriceSnapshot.price_change_24h))
        .limit(limit)
    )
    rows = result.all()

    return [
        CoinWithPrice(
            id=coin.id, slug=coin.slug, name=coin.name,
            symbol=coin.symbol, image_url=coin.image_url,
            price_usd=snap.price_usd, market_cap=snap.market_cap,
            volume_24h=snap.volume_24h, price_change_24h=snap.price_change_24h,
        )
        for coin, snap in rows
    ]


# ── Alerts ────────────────────────────────────────────────────────────────────

@router.post("/alerts", response_model=AlertOut, status_code=201)
async def create_alert(payload: AlertCreate, db: AsyncSession = Depends(get_db)):
    """Register a price alert."""
    # Validate coin exists
    result = await db.execute(select(Coin).where(Coin.id == payload.coin_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Coin not found")

    if payload.direction not in ("above", "below"):
        raise HTTPException(status_code=422, detail="direction must be 'above' or 'below'")

    alert = PriceAlert(
        email=payload.email,
        coin_id=payload.coin_id,
        target_price=payload.target_price,
        direction=payload.direction,
    )
    db.add(alert)
    await db.commit()
    await db.refresh(alert)
    return alert


@router.get("/alerts/{email}", response_model=list[AlertOut])
async def get_alerts_for_email(email: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PriceAlert)
        .where(PriceAlert.email == email)
        .order_by(PriceAlert.created_at.desc())
    )
    return result.scalars().all()


# ── Health / Admin ────────────────────────────────────────────────────────────

@router.get("/health")
async def health():
    return {"status": "ok"}


@router.post("/admin/poll", include_in_schema=False)
async def trigger_poll():
    """Manually trigger a poll cycle (dev/testing)."""
    await run_poll_cycle()
    return {"status": "poll triggered"}
