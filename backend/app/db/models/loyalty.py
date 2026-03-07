"""Loyalty account document model."""

from __future__ import annotations

from time import time

from beanie import Document
from pydantic import Field


class LoyaltyTransactionEntry(Document):
    """Embedded — not a top-level collection."""
    class Settings:
        name = "__embedded__"

    tx_id: int
    username: str
    transaction_type: str
    points: int
    description: str
    timestamp: float = Field(default_factory=time)
    store_id: int | None = None


class LoyaltyAccountDocument(Document):
    username: str
    total_points: int = 0
    lifetime_earned: int = 0
    lifetime_redeemed: int = 0
    tier: str = "Bronze"
    transactions: list[dict] = Field(default_factory=list)
    next_tx_id: int = 1

    class Settings:
        name = "loyalty_accounts"
        indexes = [
            "username",
        ]
