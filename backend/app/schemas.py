from pydantic import BaseModel, EmailStr
from typing import Optional
import datetime


class CoinOut(BaseModel):
    id: str
    slug: str
    name: str
    symbol: str
    image_url: Optional[str] = None

    model_config = {"from_attributes": True}


class CoinWithPrice(CoinOut):
    price_usd: Optional[float] = None
    market_cap: Optional[float] = None
    volume_24h: Optional[float] = None
    price_change_24h: Optional[float] = None


class PriceSnapshotOut(BaseModel):
    id: int
    coin_id: str
    price_usd: float
    market_cap: Optional[float] = None
    volume_24h: Optional[float] = None
    price_change_24h: Optional[float] = None
    captured_at: datetime.datetime

    model_config = {"from_attributes": True}


class AlertCreate(BaseModel):
    email: str
    coin_id: str
    target_price: float
    direction: str  # "above" | "below"


class AlertOut(BaseModel):
    id: int
    email: str
    coin_id: str
    target_price: float
    direction: str
    triggered: bool
    triggered_at: Optional[datetime.datetime] = None
    created_at: datetime.datetime

    model_config = {"from_attributes": True}


class TrendingResponse(BaseModel):
    coins: list[CoinWithPrice]
