"""Notification document model."""

from __future__ import annotations

from time import time

from beanie import Document
from pydantic import Field


class NotificationDocument(Document):
    notification_id: int
    username: str
    notification_type: str
    title: str
    message: str
    is_read: bool = False
    created_at: float = Field(default_factory=time)

    class Settings:
        name = "notifications"
        indexes = [
            "notification_id",
            "username",
        ]
