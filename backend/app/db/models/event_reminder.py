"""Event reminder document model."""

from __future__ import annotations

from time import time

from beanie import Document
from pydantic import Field


class EventReminderDocument(Document):
    reminder_id: int
    username: str
    event_id: int
    event_title: str
    event_date: str
    event_location: str
    created_at: float = Field(default_factory=time)

    class Settings:
        name = "event_reminders"
        indexes = [
            "reminder_id",
            "username",
            "event_id",
        ]
