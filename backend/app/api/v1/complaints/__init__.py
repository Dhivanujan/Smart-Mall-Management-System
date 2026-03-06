"""Complaints API routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.auth.schemas.users import User
from app.auth.services.security import get_current_active_user, require_admin
from app.models.complaint import ComplaintCategory, ComplaintStatus, ComplaintStore

router = APIRouter(prefix="/complaints", tags=["complaints"])

_store = ComplaintStore()

# Seed demo complaints
_store.create("customer@example.com", "queue", "Long wait at ElectroHub", "Waited 45 minutes in queue", store_id=1)
_store.create("customer@example.com", "parking", "Parking slot not available", "Could not find parking in Zone A")
_store.create("demo_user", "cleanliness", "Restroom needs cleaning", "Floor 2 restrooms are not clean")
_store.complaints[2].update_status("in_progress", "admin@example.com")


class CreateComplaintRequest(BaseModel):
    category: ComplaintCategory
    subject: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=10, max_length=2000)
    store_id: int | None = None


class UpdateStatusRequest(BaseModel):
    status: ComplaintStatus


class AssignRequest(BaseModel):
    assignee: str = Field(min_length=1, max_length=100)


class AddLogRequest(BaseModel):
    message: str = Field(min_length=1, max_length=500)


# ── Customer endpoints ──────────────────────────────────────────────

@router.get("/my")
async def my_complaints(
    current_user: User = Depends(get_current_active_user),
) -> dict:
    complaints = _store.by_user(current_user.username)
    return {
        "complaints": [c.to_dict() for c in complaints],
        "total": len(complaints),
    }


@router.post("/")
async def create_complaint(
    body: CreateComplaintRequest,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    complaint = _store.create(
        username=current_user.username,
        category=body.category,
        subject=body.subject,
        description=body.description,
        store_id=body.store_id,
    )
    return {"message": "Complaint submitted", "complaint": complaint.to_dict()}


@router.get("/{complaint_id}")
async def get_complaint(
    complaint_id: int,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    complaint = _store.get(complaint_id)
    if complaint is None:
        raise HTTPException(status_code=404, detail="Complaint not found")
    if complaint.username != current_user.username and current_user.role not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Access denied")
    return {"complaint": complaint.to_dict()}


# ── Admin endpoints ─────────────────────────────────────────────────

@router.get("/admin/all")
async def admin_list_complaints(
    status: str | None = None,
    current_user: User = Depends(require_admin),
) -> dict:
    if status:
        complaints = _store.by_status(status)  # type: ignore[arg-type]
    else:
        complaints = _store.complaints
    return {
        "complaints": [c.to_dict() for c in complaints],
        "total": len(complaints),
        "summary": _store.summary(),
    }


@router.put("/admin/{complaint_id}/status")
async def update_complaint_status(
    complaint_id: int,
    body: UpdateStatusRequest,
    current_user: User = Depends(require_admin),
) -> dict:
    complaint = _store.get(complaint_id)
    if complaint is None:
        raise HTTPException(status_code=404, detail="Complaint not found")
    complaint.update_status(body.status, current_user.username)
    return {"message": "Status updated", "complaint": complaint.to_dict()}


@router.put("/admin/{complaint_id}/assign")
async def assign_complaint(
    complaint_id: int,
    body: AssignRequest,
    current_user: User = Depends(require_admin),
) -> dict:
    complaint = _store.get(complaint_id)
    if complaint is None:
        raise HTTPException(status_code=404, detail="Complaint not found")
    complaint.assign(body.assignee, current_user.username)
    return {"message": "Complaint assigned", "complaint": complaint.to_dict()}


@router.post("/admin/{complaint_id}/escalate")
async def escalate_complaint(
    complaint_id: int,
    current_user: User = Depends(require_admin),
) -> dict:
    complaint = _store.get(complaint_id)
    if complaint is None:
        raise HTTPException(status_code=404, detail="Complaint not found")
    complaint.escalate(current_user.username)
    return {"message": "Complaint escalated", "complaint": complaint.to_dict()}


@router.post("/admin/{complaint_id}/log")
async def add_complaint_log(
    complaint_id: int,
    body: AddLogRequest,
    current_user: User = Depends(require_admin),
) -> dict:
    complaint = _store.get(complaint_id)
    if complaint is None:
        raise HTTPException(status_code=404, detail="Complaint not found")
    complaint.add_log(body.message, current_user.username)
    return {"message": "Log added", "complaint": complaint.to_dict()}
