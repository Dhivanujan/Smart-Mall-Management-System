"""Parking slot document model."""

from __future__ import annotations

from beanie import Document


class ParkingSlotDocument(Document):
    slot_id: str
    zone: str
    floor: int
    status: str = "available"
    vehicle_number: str | None = None
    reserved_by: str | None = None
    occupied_at: float | None = None
    reserved_at: float | None = None

    class Settings:
        name = "parking_slots"
        indexes = [
            "slot_id",
            "zone",
            "status",
        ]
