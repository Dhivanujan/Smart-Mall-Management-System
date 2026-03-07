"""User document model."""

from __future__ import annotations

from beanie import Document
from pydantic import Field


class UserDocument(Document):
    username: str
    full_name: str | None = None
    email: str | None = None
    role: str = "customer"
    is_active: bool = True
    hashed_password: str

    class Settings:
        name = "users"
        indexes = [
            "username",
            "email",
        ]
