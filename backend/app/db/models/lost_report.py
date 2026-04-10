"""Lost report document model."""

from __future__ import annotations

from time import time

from beanie import Document
from pydantic import Field


class LostReportDocument(Document):
    report_id: int
    username: str
    item_description: str
    last_seen_location: str
    contact_phone: str
    additional_details: str | None = None
    status: str = "open"
    created_at: float = Field(default_factory=time)

    class Settings:
        name = "lost_reports"
        indexes = [
            "report_id",
            "username",
            "status",
        ]
