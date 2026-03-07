"""Parking management API routes."""

from __future__ import annotations

from time import time

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.auth.schemas.users import User
from app.auth.services.security import get_current_active_user, require_admin
from app.db.models.parking import ParkingSlotDocument

router = APIRouter(prefix="/parking", tags=["parking"])


def _slot_dict(doc: ParkingSlotDocument) -> dict:
    return {
        "slot_id": doc.slot_id,
        "zone": doc.zone,
        "floor": doc.floor,
        "status": doc.status,
        "vehicle_number": doc.vehicle_number,
        "reserved_by": doc.reserved_by,
        "occupied_at": doc.occupied_at,
        "reserved_at": doc.reserved_at,
    }


async def _summary() -> dict:
    total = await ParkingSlotDocument.find().count()
    available = await ParkingSlotDocument.find({"status": "available"}).count()
    occupied = await ParkingSlotDocument.find({"status": "occupied"}).count()
    reserved = await ParkingSlotDocument.find({"status": "reserved"}).count()
    return {
        "total_slots": total,
        "available": available,
        "occupied": occupied,
        "reserved": reserved,
        "utilization_percent": round((occupied + reserved) / total * 100, 1) if total else 0,
    }


async def _zone_stats() -> dict:
    zones: dict[str, dict] = {}
    all_slots = await ParkingSlotDocument.find().to_list()
    for s in all_slots:
        z = zones.setdefault(s.zone, {"total": 0, "available": 0, "occupied": 0, "reserved": 0})
        z["total"] += 1
        z[s.status] = z.get(s.status, 0) + 1
    return zones


def _is_peak_hour() -> bool:
    from datetime import datetime
    hour = datetime.now().hour
    return 10 <= hour <= 20


class ReserveRequest(BaseModel):
    zone: str | None = None


class OccupyRequest(BaseModel):
    slot_id: str
    vehicle_number: str


# ── Customer endpoints ──────────────────────────────────────────────

@router.get("/summary")
async def parking_summary() -> dict:
    return {"parking": await _summary()}


@router.get("/slots")
async def list_slots(
    zone: str | None = None,
    status: str | None = None,
) -> dict:
    query: dict = {}
    if zone:
        query["zone"] = zone
    if status:
        query["status"] = status
    slots = await ParkingSlotDocument.find(query).to_list()
    return {"slots": [_slot_dict(s) for s in slots[:50]], "total": len(slots)}


@router.get("/available")
async def available_slots(zone: str | None = None) -> dict:
    query: dict = {"status": "available"}
    if zone:
        query["zone"] = zone
    available = await ParkingSlotDocument.find(query).to_list()
    suggestion = available[0] if available else None
    return {
        "available": [_slot_dict(s) for s in available[:20]],
        "total_available": len(available),
        "suggested_slot": _slot_dict(suggestion) if suggestion else None,
        "is_peak": _is_peak_hour(),
    }


@router.post("/reserve")
async def reserve_slot(
    body: ReserveRequest,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    query: dict = {"status": "available"}
    if body.zone:
        query["zone"] = body.zone
    slot = await ParkingSlotDocument.find_one(query)
    if slot is None:
        raise HTTPException(status_code=409, detail="No available slots in the requested zone")
    slot.status = "reserved"
    slot.reserved_by = current_user.username
    slot.reserved_at = time()
    await slot.save()
    return {"message": "Slot reserved successfully", "slot": _slot_dict(slot)}


@router.post("/release/{slot_id}")
async def release_slot(
    slot_id: str,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    slot = await ParkingSlotDocument.find_one(ParkingSlotDocument.slot_id == slot_id)
    if slot is None:
        raise HTTPException(status_code=404, detail="Slot not found")
    if slot.reserved_by != current_user.username and slot.vehicle_number is None:
        raise HTTPException(status_code=403, detail="Not your reservation")
    slot.status = "available"
    slot.vehicle_number = None
    slot.reserved_by = None
    slot.occupied_at = None
    slot.reserved_at = None
    await slot.save()
    return {"message": "Slot released", "slot": _slot_dict(slot)}


@router.get("/my-slots")
async def my_slots(current_user: User = Depends(get_current_active_user)) -> dict:
    reserved = await ParkingSlotDocument.find(
        {"$or": [
            {"reserved_by": current_user.username},
            {"vehicle_number": {"$ne": None}},
        ]}
    ).to_list()
    return {"slots": [_slot_dict(s) for s in reserved]}


# ── Admin endpoints ─────────────────────────────────────────────────

@router.get("/admin/overview")
async def admin_parking_overview(
    current_user: User = Depends(require_admin),
) -> dict:
    from app.ai import parking_demand_predictor
    from datetime import datetime

    now = datetime.now()
    smry = await _summary()
    prediction = parking_demand_predictor.predict_occupancy(now.hour, now.weekday())
    suggestions = parking_demand_predictor.suggest_allocation(
        smry["utilization_percent"], await _zone_stats()
    )
    return {
        "summary": smry,
        "predicted_occupancy": prediction,
        "allocation_suggestions": suggestions,
        "peak_warning": _is_peak_hour(),
    }


@router.post("/admin/occupy")
async def admin_occupy_slot(
    body: OccupyRequest,
    current_user: User = Depends(require_admin),
) -> dict:
    slot = await ParkingSlotDocument.find_one(ParkingSlotDocument.slot_id == body.slot_id)
    if slot is None:
        raise HTTPException(status_code=404, detail="Slot not found")
    if slot.status == "occupied":
        raise HTTPException(status_code=409, detail="Slot already occupied")
    slot.status = "occupied"
    slot.vehicle_number = body.vehicle_number
    slot.occupied_at = time()
    await slot.save()
    return {"message": "Slot occupied", "slot": _slot_dict(slot)}


@router.post("/admin/release/{slot_id}")
async def admin_release_slot(
    slot_id: str,
    current_user: User = Depends(require_admin),
) -> dict:
    slot = await ParkingSlotDocument.find_one(ParkingSlotDocument.slot_id == slot_id)
    if slot is None:
        raise HTTPException(status_code=404, detail="Slot not found")
    slot.status = "available"
    slot.vehicle_number = None
    slot.reserved_by = None
    slot.occupied_at = None
    slot.reserved_at = None
    await slot.save()
    return {"message": "Slot released", "slot": _slot_dict(slot)}
