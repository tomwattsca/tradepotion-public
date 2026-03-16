"""
CoinGecko API client.
Free tier: 30 calls/min. We batch requests to stay well under.
"""
import httpx
import logging
from typing import Optional
from app.config import settings

logger = logging.getLogger(__name__)

COINGECKO_BASE = settings.COINGECKO_API_URL
REQUEST_TIMEOUT = 30.0


async def fetch_markets(
    vs_currency: str = "usd",
    per_page: int = 250,
    page: int = 1,
    category: Optional[str] = None,
) -> list[dict]:
    """
    Fetch /coins/markets — up to 250 coins per call.
    Returns list of coin market data dicts.
    """
    params = {
        "vs_currency": vs_currency,
        "order": "market_cap_desc",
        "per_page": per_page,
        "page": page,
        "sparkline": "false",
        "price_change_percentage": "24h",
    }
    if category:
        params["category"] = category

    url = f"{COINGECKO_BASE}/coins/markets"
    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        return resp.json()


async def fetch_coin_list() -> list[dict]:
    """Fetch full coin list for slug mapping. Cached externally."""
    url = f"{COINGECKO_BASE}/coins/list"
    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        return resp.json()


async def fetch_categories() -> list[dict]:
    """Fetch categories list."""
    url = f"{COINGECKO_BASE}/coins/categories/list"
    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        return resp.json()
