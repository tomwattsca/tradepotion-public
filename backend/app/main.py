import logging
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.api.routes import router
from app.services.poller import start_scheduler, run_poll_cycle
from app.config import settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

scheduler = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global scheduler

    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables ensured.")

    # Run an immediate poll on startup to populate data
    logger.info("Running initial poll on startup...")
    try:
        await run_poll_cycle()
    except Exception as e:
        logger.error(f"Initial poll failed: {e}")

    # Start background scheduler
    scheduler = start_scheduler()

    yield

    # Shutdown
    if scheduler:
        scheduler.shutdown(wait=False)
    await engine.dispose()
    logger.info("Shutdown complete.")


app = FastAPI(
    title="Trade Potion — Crypto Tracker API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://tradepotion.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8090, reload=True)
