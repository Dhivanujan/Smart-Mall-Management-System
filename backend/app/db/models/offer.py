"""Offer document model."""

from __future__ import annotations

from time import time

from beanie import Document
from pydantic import Field


class OfferDocument(Document):
    offer_id: int
    store_id: int
    title: str
    description: str
    discount_percent: float
    status: str = "active"
    start_time: float = Field(default_factory=time)
    end_time: float | None = None
    redemption_count: int = 0
    max_redemptions: int | None = None
    created_at: float = Field(default_factory=time)

    class Settings:
        name = "offers"
        indexes = [
            "offer_id",
            "store_id",
            "status",
        ]
