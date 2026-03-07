"""Complaint document model."""

from __future__ import annotations

from time import time

from beanie import Document
from pydantic import Field


class ComplaintLogEntry(Document):
    """Embedded — not a top-level collection."""
    class Settings:
        name = "__embedded__"

    message: str
    author: str
    timestamp: float = Field(default_factory=time)


class ComplaintDocument(Document):
    complaint_id: int
    username: str
    category: str
    subject: str
    description: str
    status: str = "open"
    store_id: int | None = None
    assigned_to: str | None = None
    created_at: float = Field(default_factory=time)
    updated_at: float = Field(default_factory=time)
    logs: list[dict] = Field(default_factory=list)

    class Settings:
        name = "complaints"
        indexes = [
            "complaint_id",
            "username",
            "status",
        ]
