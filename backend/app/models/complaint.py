"""Complaint management models."""

from __future__ import annotations

from dataclasses import dataclass, field
from time import time
from typing import Literal

ComplaintStatus = Literal["open", "in_progress", "resolved", "escalated", "closed"]
ComplaintCategory = Literal[
    "service", "cleanliness", "parking", "queue", "store", "facility", "other"
]


@dataclass
class ComplaintLog:
    message: str
    author: str
    timestamp: float = field(default_factory=time)

    def to_dict(self) -> dict:
        return {
            "message": self.message,
            "author": self.author,
            "timestamp": self.timestamp,
        }


@dataclass
class Complaint:
    id: int
    username: str
    category: ComplaintCategory
    subject: str
    description: str
    status: ComplaintStatus = "open"
    store_id: int | None = None
    assigned_to: str | None = None
    created_at: float = field(default_factory=time)
    updated_at: float = field(default_factory=time)
    logs: list[ComplaintLog] = field(default_factory=list)

    def add_log(self, message: str, author: str) -> None:
        self.logs.append(ComplaintLog(message=message, author=author))
        self.updated_at = time()

    def update_status(self, status: ComplaintStatus, author: str) -> None:
        old = self.status
        self.status = status
        self.updated_at = time()
        self.add_log(f"Status changed from {old} to {status}", author)

    def assign(self, assignee: str, author: str) -> None:
        self.assigned_to = assignee
        self.updated_at = time()
        self.add_log(f"Assigned to {assignee}", author)

    def escalate(self, author: str) -> None:
        self.update_status("escalated", author)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "username": self.username,
            "category": self.category,
            "subject": self.subject,
            "description": self.description,
            "status": self.status,
            "store_id": self.store_id,
            "assigned_to": self.assigned_to,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "logs": [log.to_dict() for log in self.logs],
        }


@dataclass
class ComplaintStore:
    complaints: list[Complaint] = field(default_factory=list)
    _next_id: int = field(default=1, repr=False)

    def create(
        self,
        username: str,
        category: ComplaintCategory,
        subject: str,
        description: str,
        store_id: int | None = None,
    ) -> Complaint:
        complaint = Complaint(
            id=self._next_id,
            username=username,
            category=category,
            subject=subject,
            description=description,
            store_id=store_id,
        )
        self._next_id += 1
        self.complaints.append(complaint)
        return complaint

    def get(self, complaint_id: int) -> Complaint | None:
        for c in self.complaints:
            if c.id == complaint_id:
                return c
        return None

    def by_user(self, username: str) -> list[Complaint]:
        return [c for c in self.complaints if c.username == username]

    def by_status(self, status: ComplaintStatus) -> list[Complaint]:
        return [c for c in self.complaints if c.status == status]

    def summary(self) -> dict:
        return {
            "total": len(self.complaints),
            "open": len(self.by_status("open")),
            "in_progress": len(self.by_status("in_progress")),
            "resolved": len(self.by_status("resolved")),
            "escalated": len(self.by_status("escalated")),
            "closed": len(self.by_status("closed")),
        }
