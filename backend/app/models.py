from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, 
    ForeignKey, Text, ARRAY, BigInteger, func
)
from sqlalchemy.orm import relationship
from app.database import Base
import datetime


class Coin(Base):
    __tablename__ = "coins"

    id = Column(String, primary_key=True)          # CoinGecko id e.g. "bitcoin"
    slug = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    symbol = Column(String, nullable=False, index=True)
    image_url = Column(String, nullable=True)
    category_ids = Column(Text, nullable=True)     # JSON-encoded list of category ids
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    snapshots = relationship("PriceSnapshot", back_populates="coin", cascade="all, delete-orphan")
    alerts = relationship("PriceAlert", back_populates="coin", cascade="all, delete-orphan")


class PriceSnapshot(Base):
    __tablename__ = "price_snapshots"

    id = Column(Integer, primary_key=True, autoincrement=True)
    coin_id = Column(String, ForeignKey("coins.id", ondelete="CASCADE"), nullable=False, index=True)
    price_usd = Column(Float, nullable=False)
    market_cap = Column(Float, nullable=True)
    volume_24h = Column(Float, nullable=True)
    price_change_24h = Column(Float, nullable=True)  # percentage
    captured_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow, index=True)

    coin = relationship("Coin", back_populates="snapshots")


class PriceAlert(Base):
    __tablename__ = "price_alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, nullable=False, index=True)
    coin_id = Column(String, ForeignKey("coins.id", ondelete="CASCADE"), nullable=False, index=True)
    target_price = Column(Float, nullable=False)
    direction = Column(String, nullable=False)      # "above" or "below"
    triggered = Column(Boolean, default=False, nullable=False)
    triggered_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    coin = relationship("Coin", back_populates="alerts")
