"""Queue state document model."""

from __future__ import annotations

from beanie import Document
from pydantic import Field


class QueueDocument(Document):
    store_id: int
    is_paused: bool = False
    next_token: int = 1
    current_token: int | None = None
    tokens: list[dict] = Field(default_factory=list)

    class Settings:
        name = "queues"
        indexes = [
            "store_id",
        ]
