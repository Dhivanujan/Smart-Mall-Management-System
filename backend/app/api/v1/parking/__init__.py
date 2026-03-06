"""Parking management API routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.auth.schemas.users import User
from app.auth.services.security import get_current_active_user, require_admin
from app.models.parking import ParkingState

router = APIRouter(prefix="/parking", tags=["parking"])

_parking = ParkingState()

# Seed some occupied/reserved slots for demo
for _slot in _parking.slots[:15]:
    _slot.occupy(f"VH-{_slot.slot_id[-3:]}")
for _slot in _parking.slots[15:20]:
    _slot.reserve("demo_customer")


class ReserveRequest(BaseModel):
    zone: str | None = None


class OccupyRequest(BaseModel):
    slot_id: str
    vehicle_number: str


# ── Customer endpoints ──────────────────────────────────────────────

@router.get("/summary")
async def parking_summary() -> dict:
    return {"parking": _parking.summary()}


@router.get("/slots")
async def list_slots(
    zone: str | None = None,
    status: str | None = None,
) -> dict:
    slots = _parking.slots
    if zone:
        slots = [s for s in slots if s.zone == zone]
    if status:
        slots = [s for s in slots if s.status == status]
    return {"slots": [s.to_dict() for s in slots[:50]], "total": len(slots)}


@router.get("/available")
async def available_slots(zone: str | None = None) -> dict:
    available = _parking.find_available(zone)
    suggestion = _parking.suggest_slot(zone)
    return {
        "available": [s.to_dict() for s in available[:20]],
        "total_available": len(available),
        "suggested_slot": suggestion.to_dict() if suggestion else None,
        "is_peak": _parking.is_peak_hour(),
    }


@router.post("/reserve")
async def reserve_slot(
    body: ReserveRequest,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    slot = _parking.suggest_slot(body.zone)
    if slot is None:
        raise HTTPException(status_code=409, detail="No available slots in the requested zone")
    slot.reserve(current_user.username)
    return {
        "message": "Slot reserved successfully",
        "slot": slot.to_dict(),
    }


@router.post("/release/{slot_id}")
async def release_slot(
    slot_id: str,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    slot = _parking.find_slot(slot_id)
    if slot is None:
        raise HTTPException(status_code=404, detail="Slot not found")
    if slot.reserved_by != current_user.username and slot.vehicle_number is None:
        raise HTTPException(status_code=403, detail="Not your reservation")
    slot.release()
    return {"message": "Slot released", "slot": slot.to_dict()}


@router.get("/my-slots")
async def my_slots(current_user: User = Depends(get_current_active_user)) -> dict:
    reserved = [
        s.to_dict()
        for s in _parking.slots
        if s.reserved_by == current_user.username or s.vehicle_number is not None
    ]
    return {"slots": reserved}


# ── Admin endpoints ─────────────────────────────────────────────────

@router.get("/admin/overview")
async def admin_parking_overview(
    current_user: User = Depends(require_admin),
) -> dict:
    from app.ai import parking_demand_predictor
    from datetime import datetime

    now = datetime.now()
    prediction = parking_demand_predictor.predict_occupancy(now.hour, now.weekday())
    suggestions = parking_demand_predictor.suggest_allocation(
        _parking.utilization_percent(), _parking.zone_stats()
    )
    return {
        "summary": _parking.summary(),
        "predicted_occupancy": prediction,
        "allocation_suggestions": suggestions,
        "peak_warning": _parking.is_peak_hour(),
    }


@router.post("/admin/occupy")
async def admin_occupy_slot(
    body: OccupyRequest,
    current_user: User = Depends(require_admin),
) -> dict:
    slot = _parking.find_slot(body.slot_id)
    if slot is None:
        raise HTTPException(status_code=404, detail="Slot not found")
    if slot.status == "occupied":
        raise HTTPException(status_code=409, detail="Slot already occupied")
    slot.occupy(body.vehicle_number)
    return {"message": "Slot occupied", "slot": slot.to_dict()}


@router.post("/admin/release/{slot_id}")
async def admin_release_slot(
    slot_id: str,
    current_user: User = Depends(require_admin),
) -> dict:
    slot = _parking.find_slot(slot_id)
    if slot is None:
        raise HTTPException(status_code=404, detail="Slot not found")
    slot.release()
    return {"message": "Slot released", "slot": slot.to_dict()}
