"""User document model."""

from __future__ import annotations

from datetime import datetime

from beanie import Document


class UserDocument(Document):
    username: str
    full_name: str | None = None
    email: str | None = None
    role: str = "customer"
    is_active: bool = True
    hashed_password: str

    # Advanced Security Fields (Phase 2)
    last_login: datetime | None = None
    failed_login_attempts: int = 0
    is_locked: bool = False
    two_factor_enabled: bool = False

    class Settings:
        name = "users"
        indexes = [
            "username",
            "email",
        ]
