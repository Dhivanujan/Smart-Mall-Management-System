"""MongoDB connection lifecycle using Motor + Beanie."""

from __future__ import annotations

import logging

from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from ..core.config import get_settings

logger = logging.getLogger("smart_mall.db")

_client: AsyncIOMotorClient | None = None


async def init_db() -> None:
    """Connect to MongoDB and initialise Beanie document models."""
    global _client

    settings = get_settings()
    logger.info("Connecting to MongoDB", extra={"url": settings.mongodb_url})

    _client = AsyncIOMotorClient(settings.mongodb_url)
    db = _client[settings.mongodb_db_name]

    from .models import ALL_DOCUMENT_MODELS

    await init_beanie(database=db, document_models=ALL_DOCUMENT_MODELS)
    logger.info("MongoDB initialised", extra={"database": settings.mongodb_db_name})


async def close_db() -> None:
    """Close the MongoDB connection."""
    global _client
    if _client is not None:
        _client.close()
        _client = None
        logger.info("MongoDB connection closed")


def get_client() -> AsyncIOMotorClient:
    """Return the active Motor client."""
    if _client is None:
        raise RuntimeError("MongoDB client not initialised — call init_db() first")
    return _client
