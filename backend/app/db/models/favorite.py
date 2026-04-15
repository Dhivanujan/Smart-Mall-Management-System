"""Favorite stores/offers document model."""

from __future__ import annotations

from time import time

from beanie import Document
from pydantic import Field


class FavoriteDocument(Document):
    favorite_id: int
    username: str
    item_type: str
    item_id: int
    created_at: float = Field(default_factory=time)

    class Settings:
        name = "favorites"
        indexes = [
            "favorite_id",
            "username",
            "item_type",
            "item_id",
        ]
