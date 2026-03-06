"""Parking domain models."""

from __future__ import annotations

from dataclasses import dataclass, field
from time import time
from typing import Literal

ParkingSlotStatus = Literal["available", "occupied", "reserved", "maintenance"]
ParkingZone = Literal["A", "B", "C", "D"]


@dataclass
class ParkingSlot:
    slot_id: str
    zone: ParkingZone
    floor: int
    status: ParkingSlotStatus = "available"
    vehicle_number: str | None = None
    reserved_by: str | None = None
    occupied_at: float | None = None
    reserved_at: float | None = None

    def reserve(self, username: str) -> None:
        self.status = "reserved"
        self.reserved_by = username
        self.reserved_at = time()

    def occupy(self, vehicle_number: str) -> None:
        self.status = "occupied"
        self.vehicle_number = vehicle_number
        self.occupied_at = time()

    def release(self) -> None:
        self.status = "available"
        self.vehicle_number = None
        self.reserved_by = None
        self.occupied_at = None
        self.reserved_at = None

    def duration_minutes(self) -> float:
        if self.occupied_at is None:
            return 0.0
        return (time() - self.occupied_at) / 60.0

    def to_dict(self) -> dict:
        return {
            "slot_id": self.slot_id,
            "zone": self.zone,
            "floor": self.floor,
            "status": self.status,
            "vehicle_number": self.vehicle_number,
            "reserved_by": self.reserved_by,
            "duration_minutes": round(self.duration_minutes(), 1),
        }


@dataclass
class ParkingState:
    total_slots: int = 200
    slots: list[ParkingSlot] = field(default_factory=list)

    def __post_init__(self) -> None:
        if not self.slots:
            self.slots = self._generate_slots()

    def _generate_slots(self) -> list[ParkingSlot]:
        slots: list[ParkingSlot] = []
        zones: list[ParkingZone] = ["A", "B", "C", "D"]
        per_zone = self.total_slots // len(zones)
        for zone in zones:
            for i in range(1, per_zone + 1):
                floor = (i - 1) // 25 + 1
                slots.append(
                    ParkingSlot(
                        slot_id=f"{zone}-{i:03d}",
                        zone=zone,
                        floor=floor,
                    )
                )
        return slots

    def available_count(self) -> int:
        return sum(1 for s in self.slots if s.status == "available")

    def occupied_count(self) -> int:
        return sum(1 for s in self.slots if s.status == "occupied")

    def reserved_count(self) -> int:
        return sum(1 for s in self.slots if s.status == "reserved")

    def utilization_percent(self) -> float:
        used = self.occupied_count() + self.reserved_count()
        return round((used / len(self.slots)) * 100, 1) if self.slots else 0.0

    def zone_stats(self) -> dict[str, dict]:
        stats: dict[str, dict] = {}
        for zone in ["A", "B", "C", "D"]:
            zone_slots = [s for s in self.slots if s.zone == zone]
            available = sum(1 for s in zone_slots if s.status == "available")
            occupied = sum(1 for s in zone_slots if s.status == "occupied")
            reserved = sum(1 for s in zone_slots if s.status == "reserved")
            stats[zone] = {
                "total": len(zone_slots),
                "available": available,
                "occupied": occupied,
                "reserved": reserved,
                "utilization_percent": round(
                    ((occupied + reserved) / len(zone_slots)) * 100, 1
                )
                if zone_slots
                else 0.0,
            }
        return stats

    def find_slot(self, slot_id: str) -> ParkingSlot | None:
        for s in self.slots:
            if s.slot_id == slot_id:
                return s
        return None

    def find_available(self, zone: str | None = None) -> list[ParkingSlot]:
        return [
            s
            for s in self.slots
            if s.status == "available" and (zone is None or s.zone == zone)
        ]

    def suggest_slot(self, zone: str | None = None) -> ParkingSlot | None:
        available = self.find_available(zone)
        return available[0] if available else None

    def is_peak_hour(self) -> bool:
        return self.utilization_percent() > 80.0

    def summary(self) -> dict:
        return {
            "total_slots": len(self.slots),
            "available": self.available_count(),
            "occupied": self.occupied_count(),
            "reserved": self.reserved_count(),
            "utilization_percent": self.utilization_percent(),
            "is_peak": self.is_peak_hour(),
            "zone_stats": self.zone_stats(),
        }
