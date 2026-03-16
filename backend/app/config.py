from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str
    DATABASE_URL_SYNC: str
    COINGECKO_API_URL: str = "https://api.coingecko.com/api/v3"
    POLL_INTERVAL_SECONDS: int = 300
    RESEND_API_KEY: Optional[str] = None
    FROM_EMAIL: str = "alerts@tradepotion.com"
    APP_ENV: str = "development"

    class Config:
        env_file = ".env"

settings = Settings()
