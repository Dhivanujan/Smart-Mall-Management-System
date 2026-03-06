"""Notification models."""

from __future__ import annotations

from dataclasses import dataclass, field
from time import time
from typing import Literal

NotificationType = Literal[
    "queue_status", "offer", "parking_expiry", "complaint_response", "loyalty", "system"
]


@dataclass
class Notification:
    id: int
    username: str
    notification_type: NotificationType
    title: str
    message: str
    is_read: bool = False
    created_at: float = field(default_factory=time)

    def mark_read(self) -> None:
        self.is_read = True

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "username": self.username,
            "notification_type": self.notification_type,
            "title": self.title,
            "message": self.message,
            "is_read": self.is_read,
            "created_at": self.created_at,
        }


@dataclass
class NotificationStore:
    notifications: list[Notification] = field(default_factory=list)
    _next_id: int = field(default=1, repr=False)

    def create(
        self,
        username: str,
        notification_type: NotificationType,
        title: str,
        message: str,
    ) -> Notification:
        n = Notification(
            id=self._next_id,
            username=username,
            notification_type=notification_type,
            title=title,
            message=message,
        )
        self._next_id += 1
        self.notifications.append(n)
        return n

    def for_user(self, username: str, unread_only: bool = False) -> list[Notification]:
        result = [n for n in self.notifications if n.username == username]
        if unread_only:
            result = [n for n in result if not n.is_read]
        return result

    def unread_count(self, username: str) -> int:
        return len(self.for_user(username, unread_only=True))

    def mark_read(self, notification_id: int) -> bool:
        for n in self.notifications:
            if n.id == notification_id:
                n.mark_read()
                return True
        return False

    def mark_all_read(self, username: str) -> int:
        count = 0
        for n in self.notifications:
            if n.username == username and not n.is_read:
                n.mark_read()
                count += 1
        return count
