"""Movie booking document model."""

from __future__ import annotations

from time import time

from beanie import Document
from pydantic import Field


class MovieBookingDocument(Document):
    booking_id: int
    username: str
    movie_id: int
    movie_title: str
    showtime: str
    booking_status: str = "booked"
    created_at: float = Field(default_factory=time)

    class Settings:
        name = "movie_bookings"
        indexes = [
            "booking_id",
            "username",
            "movie_id",
            "booking_status",
        ]
